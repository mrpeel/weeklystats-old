! function e(t, i, r) {
    function o(s, c) {
        if (!i[s]) {
            if (!t[s]) {
                var a = "function" == typeof require && require;
                if (!c && a) return a(s, !0);
                if (n) return n(s, !0);
                var p = new Error("Cannot find module '" + s + "'");
                throw p.code = "MODULE_NOT_FOUND", p
            }
            var u = i[s] = {
                exports: {}
            };
            t[s][0].call(u.exports, function (e) {
                var i = t[s][1][e];
                return o(i ? i : e)
            }, u, u.exports, e, t, i, r)
        }
        return i[s].exports
    }
    for (var n = "function" == typeof require && require, s = 0; s < r.length; s++) o(r[s]);
    return o
}({
    1: [function (e) {
        var t = e("javascript-api-utils/lib/account-summaries");
        gapi.analytics.ready(function () {
            function e(e, t, i) {
                e.innerHTML = t.map(function (e) {
                    var t = e.id == i ? "selected " : " ";
                    return "<option " + t + 'value="' + e.id + '">' + e.name + "</option>"
                }).join("")
            }

            function i(e) {
                return e.ids || e.viewId ? {
                    prop: "viewId",
                    value: e.viewId || e.ids && e.ids.replace(/^ga:/, "")
                } : e.propertyId ? {
                    prop: "propertyId",
                    value: e.propertyId
                } : e.accountId ? {
                    prop: "accountId",
                    value: e.accountId
                } : void 0
            }
            gapi.analytics.createComponent("ViewSelector2", {
                execute: function () {
                    return this.setup_(function () {
                        this.updateAccounts_(), this.changed_ && (this.render_(), this.onChange_())
                    }.bind(this)), this
                },
                set: function (e) {
                    if (!!e.ids + !!e.viewId + !!e.propertyId + !!e.accountId > 1) throw new Error('You cannot specify more than one of the following options: "ids", "viewId", "accountId", "propertyId"');
                    if (e.container && this.container) throw new Error("You cannot change containers once a view selector has been rendered on the page.");
                    var t = this.get();
                    return (t.ids != e.ids || t.viewId != e.viewId || t.propertyId != e.propertyId || t.accountId != e.accountId) && (t.ids = null, t.viewId = null, t.propertyId = null, t.accountId = null), gapi.analytics.Component.prototype.set.call(this, e)
                },
                setup_: function (e) {
                    function i() {
                        t.get().then(function (t) {
                            r.summaries = t, r.accounts = r.summaries.all(), e()
                        }, function (e) {
                            r.emit("error", e)
                        })
                    }
                    var r = this;
                    gapi.analytics.auth.isAuthorized() ? i() : gapi.analytics.auth.on("success", i)
                },
                updateAccounts_: function () {
                    var e, t, r, o = this.get(),
                        n = i(o);
                    if (n) switch (n.prop) {
                        case "viewId":
                            e = this.summaries.getProfile(n.value), t = this.summaries.getAccountByProfileId(n.value), r = this.summaries.getWebPropertyByProfileId(n.value);
                            break;
                        case "propertyId":
                            r = this.summaries.getWebProperty(n.value), t = this.summaries.getAccountByWebPropertyId(n.value), e = r && r.views && r.views[0];
                            break;
                        case "accountId":
                            t = this.summaries.getAccount(n.value), r = t && t.properties && t.properties[0], e = r && r.views && r.views[0]
                    } else t = this.accounts[0], r = t && t.properties && t.properties[0], e = r && r.views && r.views[0];
                    t || r || e ? (t != this.account || r != this.property || e != this.view) && (this.changed_ = {
                        account: t && t != this.account,
                        property: r && r != this.property,
                        view: e && e != this.view
                    }, this.account = t, this.properties = t.properties, this.property = r, this.views = r && r.views, this.view = e, this.ids = e && "ga:" + e.id) : this.emit("error", new Error("You do not have access to " + n.prop.slice(0, -2) + " : " + n.value))
                },
                render_: function () {
                    var t = this.get();
                    this.container = "string" == typeof t.container ? document.getElementById(t.container) : t.container, this.container.innerHTML = t.template || this.template;
                    var i = this.container.querySelectorAll("select"),
                        r = this.accounts,
                        o = this.properties || [{
                            name: "(Empty)",
                            id: ""
                        }],
                        n = this.views || [{
                            name: "(Empty)",
                            id: ""
                        }];
                    e(i[0], r, this.account.id), e(i[1], o, this.property && this.property.id), e(i[2], n, this.view && this.view.id), i[0].onchange = this.onUserSelect_.bind(this, i[0], "accountId"), i[1].onchange = this.onUserSelect_.bind(this, i[1], "propertyId"), i[2].onchange = this.onUserSelect_.bind(this, i[2], "viewId")
                },
                onChange_: function () {
                    var e = {
                        account: this.account,
                        property: this.property,
                        view: this.view,
                        ids: this.view && "ga:" + this.view.id
                    };
                    this.changed_ && (this.changed_.account && this.emit("accountChange", e), this.changed_.property && this.emit("propertyChange", e), this.changed_.view && (this.emit("viewChange", e), this.emit("idsChange", e), this.emit("change", e.ids))), this.changed_ = null
                },
                onUserSelect_: function (e, t) {
                    var i = {};
                    i[t] = e.value, this.set(i), this.execute()
                },
                template: '<div class="ViewSelector2">  <div class="ViewSelector2-item">    <select></select>  </div>  <div class="ViewSelector2-item">     <select></select>  </div>  <div class="ViewSelector2-item">    <select></select>  </div></div>'
            })
        })
    }, {
        "javascript-api-utils/lib/account-summaries": 3
    }],
    2: [function (e, t) {
        function i(e) {
            this.accounts_ = e, this.webProperties_ = [], this.profiles_ = [], this.accountsById_ = {}, this.webPropertiesById_ = this.propertiesById_ = {}, this.profilesById_ = this.viewsById_ = {};
            for (var t, i = 0; t = this.accounts_[i]; i++)
                if (this.accountsById_[t.id] = {
                        self: t
                    }, t.webProperties) {
                    r(t, "webProperties", "properties");
                    for (var o, n = 0; o = t.webProperties[n]; n++)
                        if (this.webProperties_.push(o), this.webPropertiesById_[o.id] = {
                                self: o,
                                parent: t
                            }, o.profiles) {
                            r(o, "profiles", "views");
                            for (var s, c = 0; s = o.profiles[c]; c++) this.profiles_.push(s), this.profilesById_[s.id] = {
                                self: s,
                                parent: o,
                                grandParent: t
                            }
                        }
                }
        }

        function r(e, t, i) {
            Object.defineProperty ? Object.defineProperty(e, i, {
                get: function () {
                    return e[t]
                }
            }) : e[i] = e[t]
        }
        i.prototype.all = function () {
            return this.accounts_
        }, r(i.prototype, "all", "allAccounts"), i.prototype.allWebProperties = function () {
            return this.webProperties_
        }, r(i.prototype, "allWebProperties", "allProperties"), i.prototype.allProfiles = function () {
            return this.profiles_
        }, r(i.prototype, "allProfiles", "allViews"), i.prototype.get = function (e) {
            if (!!e.accountId + !!e.webPropertyId + !!e.propertyId + !!e.profileId + !!e.viewId > 1) throw new Error('get() only accepts an object with a single property: either "accountId", "webPropertyId", "propertyId", "profileId" or "viewId"');
            return this.getProfile(e.profileId || e.viewId) || this.getWebProperty(e.webPropertyId || e.propertyId) || this.getAccount(e.accountId)
        }, i.prototype.getAccount = function (e) {
            return this.accountsById_[e] && this.accountsById_[e].self
        }, i.prototype.getWebProperty = function (e) {
            return this.webPropertiesById_[e] && this.webPropertiesById_[e].self
        }, r(i.prototype, "getWebProperty", "getProperty"), i.prototype.getProfile = function (e) {
            return this.profilesById_[e] && this.profilesById_[e].self
        }, r(i.prototype, "getProfile", "getView"), i.prototype.getAccountByProfileId = function (e) {
            return this.profilesById_[e] && this.profilesById_[e].grandParent
        }, r(i.prototype, "getAccountByProfileId", "getAccountByViewId"), i.prototype.getWebPropertyByProfileId = function (e) {
            return this.profilesById_[e] && this.profilesById_[e].parent
        }, r(i.prototype, "getWebPropertyByProfileId", "getPropertyByViewId"), i.prototype.getAccountByWebPropertyId = function (e) {
            return this.webPropertiesById_[e] && this.webPropertiesById_[e].parent
        }, r(i.prototype, "getAccountByWebPropertyId", "getAccountByPropertyId"), t.exports = i
    }, {}],
    3: [function (e, t) {
        function i() {
            var e = gapi.client.analytics.management.accountSummaries.list().then(function (e) {
                return e
            });
            return new e.constructor(function (t, i) {
                var r = [];
                e.then(function n(e) {
                    var s = e.result;
                    s.items ? r = r.concat(s.items) : i(new Error("You do not have any Google Analytics accounts. Go to http://google.com/analytics to sign up.")), s.startIndex + s.itemsPerPage <= s.totalResults ? gapi.client.analytics.management.accountSummaries.list({
                        "start-index": s.startIndex + s.itemsPerPage
                    }).then(n) : t(new o(r))
                }).then(null, i)
            })
        }
        var r, o = e("./account-summaries");
        t.exports = {
            get: function (e) {
                return e && (r = null), r || (r = i())
            }
        }
    }, {
        "./account-summaries": 2
    }]
}, {}, [1]);
//# sourceMappingURL=view-selector2.js.map
