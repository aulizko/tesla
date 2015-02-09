'use strict';

var Ractive = require('ractive');
var _ = require('lodash');
/*eslint-disable */
var Promise = global.Promise || require('bluebird');
/*eslint-enable */
var glob = require('glob');
var fs = require('graceful-fs');
var path = require('path');

function RactiveViewEngine(config) {
    this.Ractive = config.Ractive || this.Ractive;
    this.extname = config.extname || this.extname;

    this.helpers = config.helpers ? _.extend(this.helpers, config.helpers) : this.helpers;
    this.layoutsDir = config.layoutsDir || this.layoutsDir;
    this.partialsDir = config.partialsDir || this.partialsDir;
    this.delimiter = config.delimiter || this.delimiter;
    this.layoutsNameSpace = config.layoutsNameSpace || this.layoutsNameSpace;


    if (this.extname.charAt(0) !== '.') {
        this.extname = '.' + this.extname;
    }

    this.defaultLayout = config.defaultLayout || this.layoutsNameSpace + this.delimiter + 'default';

    this.compiled = config.compiled || {};
    this._fsCache = {};
    this.engine = this.renderView.bind(this);
}

RactiveViewEngine.prototype.Ractive = Ractive;
RactiveViewEngine.prototype.extname = '.html';
RactiveViewEngine.prototype.layoutsDir = 'views/layouts/';
RactiveViewEngine.prototype.partialsDir = 'views/partials/';
RactiveViewEngine.prototype.delimiter = '-';
RactiveViewEngine.prototype.layoutsNameSpace = 'layout';
RactiveViewEngine.prototype.helpers = {
    isActive: function (link) {
        /*global req*/
        if (link === '/' ) {
            return req.url === '/' ? 'active' : '';
        } else {
            return req.url.indexOf(link) === -1 ? '' : 'active';
        }
    }
};

RactiveViewEngine.prototype.renderView = function (viewPath, options, callback) {
    options.data = _.omit(options, ['cache', 'settings', '_locals', 'layout', 'helpers']);

    var helpers = options.helpers ? _.extend(this.helpers, options.helpers) : this.helpers;

    _.assign(this.Ractive.defaults.data, helpers);

    return Promise.all([
        // refresh layouts and partials with respect to cache setting from Express
        this.getLayouts(options),
        this.getPartials(options)
    ]).then(function(data) {
        var layouts = data[0];
        var partials = data[1];



        // extend Ractive defaults
        // todo: should I pollute Ractive global defaults with layouts and partials
        _.assign(this.Ractive.components, layouts);
        _.assign(this.Ractive.partials, partials);

        return Promise.resolve();
    }.bind(this)).then(function () {
        return this.getTemplate(viewPath, options);
    }.bind(this)).then(function(template) {
        var context;
        var layout = 'layout' in options ? options.layout : this.defaultLayout;

        var optionsForRender = _.extend({}, options, {template: template});


        if (layout) {
            // prefix layout with layoutsNameSpace
            if (layout.indexOf(this.layoutsNameSpace) !== 0) {
                layout = this.layoutsNameSpace + this.delimiter + layout;
            }

            optionsForRender = _.extend({}, options, {
                partials: {
                    pagecontent: template
                }
            });

            context = new this.Ractive.components[layout](optionsForRender);
        } else {
            context = new this.Ractive(optionsForRender);
        }

        return context.toHTML();
    }.bind(this)).then(function(html) {
        setImmediate(function() {
            callback(null, html);
        });
    }).catch(function(reason) {
        setImmediate(function () {
            callback(reason);
        });
    });
};

RactiveViewEngine.prototype.getLayouts = function(options) {
    options = options || (options = {});

    return this.getTemplates(this.layoutsDir, options)
        .then(function (templates) {
            var result = {};
            _.each(templates, function(template, filePath) {
                var partialName = this._getPartialName(filePath, this.layoutsNameSpace);
                result[partialName] = template;
            }.bind(this));

            return result;
        }.bind(this))
        .then(function(templates) {
            var result = {};
            _.each(templates, function(template, filePath) {
                result[filePath] = this.Ractive.extend({
                    template: template
                });
            }.bind(this));

            return result;
        }.bind(this));
};

RactiveViewEngine.prototype.getPartials = function(options) {
    options = options || (options = {});

    var partialsDirs = Array.isArray(this.partialsDir) ?
        this.partialsDir : [this.partialsDir];

    partialsDirs = partialsDirs.map(function (dir) {
        var dirPath,
            dirTemplates,
            dirNamespace;

        // Support `partialsDir` collection with object entries that contain a
        // templates promise and a namespace.
        if (typeof dir === 'string') {
            dirPath = dir;
        } else if (typeof dir === 'object') {
            dirTemplates = dir.templates;
            dirNamespace = dir.namespace;
            dirPath = dir.dir;
        }

        // We must have some path to templates, or templates themselves.
        if (!(dirPath || dirTemplates)) {
            throw new Error('A partials dir must be a string or config object');
        }

        // Make sure we're have a promise for the templates.
        var templatesPromise = dirTemplates ? Promise.resolve(dirTemplates) :
            this.getTemplates(dirPath, options);

        return templatesPromise.then(function (templates) {
            return {
                templates: templates,
                namespace: dirNamespace
            };
        });
    }, this);

    return Promise.all(partialsDirs).then(function (dirs) {
        var getPartialName = this._getPartialName.bind(this);

        return dirs.reduce(function (partials, dir) {
            var templates = dir.templates,
                namespace = dir.namespace,
                filePaths = Object.keys(templates);

            filePaths.forEach(function (filePath) {
                var partialName = getPartialName(filePath, namespace);
                partials[partialName] = templates[filePath];
            });

            return partials;
        }, {});
    }.bind(this));
};

RactiveViewEngine.prototype.getTemplate = function(filePath, options) {
    var cache = this.compiled;
    var template = options.cache && cache[filePath];

    filePath = path.resolve(filePath);
    options = options || (options = {});

    if (template) {
        return template;
    }

    // Optimistically cache template promise to reduce file system I/O, but
    // remove from cache if there was a problem.
    template = cache[filePath] = this.__getFile(filePath, options)
        .then(function (file) {
            return this.compileTemplate(file, options);
        }.bind(this));

    return template.catch(function (err) {
        delete cache[filePath];
        throw err;
    });
};

RactiveViewEngine.prototype.getTemplates = function (dirPath, options) {
    return this._getDir(dirPath, options).then(function (filePaths) {
        var templates = filePaths.map(function (filePath) {
            return this.getTemplate(path.join(dirPath, filePath), options);
        }, this);

        return Promise.all(templates).then(function (templatesInner) {
            return filePaths.reduce(function (map, filePath, i) {
                map[filePath] = templatesInner[i];
                return map;
            }, {});
        });
    }.bind(this));
};

RactiveViewEngine.prototype.compileTemplate = function (template) {
    return this.Ractive.parse(template);
};

RactiveViewEngine.prototype.__getFile = function(filePath, options) {
    var cache = this._fsCache;
    var file = options.cache && cache[filePath];

    filePath = path.resolve(filePath);

    if (file) {
        return file;
    }

    // Optimistically cache file promise to reduce file system I/O, but remove
    // from cache if there was a problem.
    file = cache[filePath] = new Promise(function (resolve, reject) {
        fs.readFile(filePath, 'utf8', function (err, fileInner) {
            if (err) {
                reject(err);
            } else {
                resolve(fileInner);
            }
        });
    });

    return file.catch(function (err) {
        delete cache[filePath];
        throw err;
    });
};

RactiveViewEngine.prototype._getDir = function (dirPath, options) {
    var cache = this._fsCache;
    var dir = options.cache && cache[dirPath];

    dirPath = path.resolve(dirPath);

    if (dir) {
        return dir.then(function (dirInner) {
            return dirInner.concat();
        });
    }

    var pattern = '**/*' + this.extname;

    // Optimistically cache dir promise to reduce file system I/O, but remove
    // from cache if there was a problem.
    dir = cache[dirPath] = new Promise(function (resolve, reject) {
        glob(pattern, {cwd: dirPath}, function (err, dirInner) {
            if (err) {
                reject(err);
            } else {
                resolve(dirInner);
            }
        });
    });

    return dir.then(function (dirInner) {
        return dirInner.concat();
    }).catch(function (err) {
        delete cache[dirPath];
        throw err;
    });
};

RactiveViewEngine.prototype._getPartialName = function (filePath, namespace) {
    var extRegex = new RegExp(this.extname + '$');
    var name = filePath.replace(extRegex, '');
    var chunks;

    if (~name.indexOf('/')) {
        chunks = name.split('/');
        name = chunks.shift() + _.map(chunks, function(chunk) {
                return chunk[0].toUpperCase() + chunk.substr(1);
            }).join('');
    }

    if (namespace) {
        name = namespace + this.delimiter + name;
    }

    return name;
};

module.exports = RactiveViewEngine;
