const template = document.createElement('template');

template.innerHTML = `
<style class="wow--table__styles">
    /* settings */
    :host {
        --t-border-radius: 4px;
        --t-border: var(--t-border-width) var(--t-border-style) var(--t-border-color);
        --tc-border: var(--tc-border-width) var(--tc-border-style) var(--tc-border-color);
        --tc-padding: var(--tc-pt) var(--tc-pr) var(--tc-pb) var(--tc-pl);
        --c-margin: var(--c-mt) var(--c-mr) var(--c-mb) var(--c-ml); 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        display: block;
    }
    :host * {
        box-sizing: border-box;
    }
    .wow--container {
        color: var(--color, #040f0f);
        background-color: var(--bg, #fff);
        display: var(--c-display, inline-flex);
        align-items: var(--c-align, center);
        justify-content: var(--c-justify, center);
        position: relative;
        visibility: hidden;
        margin: var(--c-margin, .25rem);
    }
    .wow--loading__false {
        visibility: visible;
    }
    /****************/
    .wow--table {
        border: var(--t-border, 4px solid #000);
        /**
         * TODO: Why won't the border radius apply to the table
         */
        border-radius: var(--t-border-radius, 4px);
        border-collapse: var(--t-border-collapse, collapse);
    }
    .wow--cell {
        border: var(--tc-border, 1px solid #000);
        text-align: var(--tc-talign, center);
        font-variant-numeric: var(--tc-font-variant, tabular-nums);
        padding: var(--tc-padding, .25rem);
    }
    .wow--heading {
        text-align: inherit;
    }
    .wow--row:hover {
        background-color: var(--bg-hover, #f0f1ff);
    }
</style>
<div class="wow--container">
    <table class="wow--table"></table>
</div>
`;

class WowTable extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.table = this._shadowRoot.querySelector('.wow--table');
        this.container = this._shadowRoot.querySelector('.wow--container');
        this.json = this.hasAttribute('json') ? this.getAttribute('json') : '';
        this.file = this.hasAttribute('file') ? this.getAttribute('file') : '';
    }

    static get observedAttributes() {
        return [
            'file',
            'json',
            'loading',
            'delimiter',
            'titles'
        ];
    }

    _getFile(src) {
        return fetch(src);
    }

    CSVtoArr(csv, delimiter = ',') {
        let csvCleaned = csv.split('').map(char => (char === '"' || char === ' ') ? '' : char).join('');

        const data = csvCleaned
            .split('\n')
            .map(v => v.split(delimiter));

        return data;
    };

    loading(value) {
        this.setAttribute('loading', value);
        value === 'false' ? this.container.classList.add(`wow--loading__false`) : this.container.classList.remove(`wow--loading__false`);
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (newVal === null) return;

        if (name === 'file') {
            this.loading('true')
            this._getFile(newVal)
                .then(data => data.text())
                .then(text => this.checkDelimiter(text))
                .then(csv => this.CSVtoArr(csv))
                .then(arr => this.buildTable(arr))
                .then(_ => this.loading('false'))
        }

        if (name === 'json') {
            this.loading('true')
            this.buildTable(newVal)
                .then(_ => this.loading('false'))

        }
    }

    _genID(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    checkDelimiter(text) {
        /** Possible delimiters per [this page](https://data-gov.tw.rpi.edu/wiki/CSV_files_use_delimiters_other_than_commas) plus the delimiter that was given as an attribute */
        const possibleDelimiters = [...new Set([',', '\t', ';', '|', '^', this.getAttribute('delimiter')])];
        const usedDelimiters = {};

        for (const character of text) {
            if (possibleDelimiters.includes(character)) {
                if (usedDelimiters[character] === undefined) {
                    usedDelimiters[character] = 1;
                    continue;
                }
                usedDelimiters[character] += 1;
            }
        }

        return text;
    }

    /**
     * 
     * @param {Object} config An object with config options: el == element to create; classList == array of classes to apply to element
     * attr == attributes to apply to element; content == Text content;
     */
    buildEl(config) {
        const { el, classList, attrs, content } = config;

        const domEl = document.createElement(el);

        if (classList !== undefined) {
            classList.forEach(className => domEl.classList.add(className));
        }

        if (attrs !== undefined) {
            for (const attr in attrs) {
                domEl.setAttribute(attr, attrs[attr]);
            }
        }

        if (content !== undefined) {
            const text = document.createTextNode(content);
            domEl.appendChild(text);
        }

        return domEl;
    }

    /**
     * buildTable
     * @param {arr} data A 2D array containing the parsed CSV file
     */
    buildTable(data) {
        console.time('table build start');
        this.clearTable();

        const tpl = document.createDocumentFragment();
        const body = this.buildEl({
            el: 'tbody',
            classList: ['wow--body'],
            attrs: {
                id: `wow--body-${this._genID(10)}`
            }
        });

        if (this.getAttribute('titles')) {

            /* grab the first array from the data array */
            /* MUTATES */
            const firstRow = data.splice(0, 1)[0];

            const header = this.buildHeader(firstRow);
            this.table.appendChild(header);
        }

        for (const row of data) {
            const bRow = this.buildEl({
                el: 'tr',
                classList: ['wow--row']
            });

            const bCells = this.buildCells(row, bRow);

            body.appendChild(bCells);
        }

        tpl.appendChild(body);

        this.table.appendChild(tpl);
        console.timeEnd('table build start')
        return new Promise(res => res())
    }

    buildHeader(arr) {
        const header = this.buildEl({
            el: 'thead',
            classList: ['wow--header'],
            attrs: {
                id: `wow--header-${this._genID(10)}`
            }
        });

        const hRow = this.buildEl({
            el: 'tr',
            classList: ['wow--row']
        })

        for (const title of arr) {
            const th = this.buildEl({
                el: 'th',
                classList: ['wow--cell', 'wow--heading'],
                content: title
            })

            hRow.appendChild(th);
            header.appendChild(hRow);
        }
        return header;
    }

    buildCells(arr, parent) {
        for (const cell of arr) {
            const domCell = this.buildEl({
                el: 'td',
                classList: ['wow--cell'],
                content: cell,
            })
            parent.appendChild(domCell);
        }

        return parent;
    }

    clearTable() {
        const children = [...this.container.querySelectorAll('.wow--table > *')];
        for (const child of children) {
            this.table.removeChild(child);
        }
    }
}

window.customElements.define('wow-table', WowTable);