/*global gapi, document */

gapi.analytics.ready(function () {
    function convertDate(t) {
        if (n.test(t)) return t;
        var i = a.exec(t);
        if (i) return returnDate(+i[1]);
        if ("today" == t) return returnDate(0);
        if ("yesterday" == t) return returnDate(1);
        throw new Error("Cannot convert date " + t);
    }

    function returnDate(t) {
        var e = new Date();
        e.setDate(e.getDate() - t);
        var a = String(e.getMonth() + 1);
        a = 1 == a.length ? "0" + a : a;
        var n = String(e.getDate());
        return n = 1 == n.length ? "0" + n : n, e.getFullYear() + "-" + a + "-" + n;
    }
    var a = /(\d+)daysAgo/,
        n = /\d{4}\-\d{2}\-\d{2}/;
    gapi.analytics.createComponent("DateRangeSelector", {
        execute: function () {
            var e = this.get();
            e["start-date"] = e["start-date"] || "7daysAgo";
            this.container = "string" == typeof e.container ? document.getElementById(e.container) : e.container, e.template && (this.template = e.template);
            this.container.innerHTML = this.template;
            var a = this.container.querySelectorAll("input");
            return this.startDateInput = a[0], this.startDateInput.value = convertDate(e["start-date"]), this.setValues(), this.container.onchange = this.onChange.bind(this), this;
        },
        onChange: function () {
            this.setValues();
            this.emit("change", {
                "start-date": this["start-date"]
            });
        },
        setValues: function () {
            this["start-date"] = this.startDateInput.value;
        },
        template: '<div class="DateRangeSelector"> <div class="DateRangeSelector-item"> <input type="date"> </div> </div>'
		
		
    });
});