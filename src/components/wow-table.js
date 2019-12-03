const template = document.createElement('template');

template.innerHTML = `
<style class="wow--table__styles">
    /* settings */
    :host {
        --bg: #fff;
        --bg-hover: #f0f1ff;
        --black: #040f0f;
        --l-height: 80px;
        --l-width: 80px;
        --l-border-color: #fff;
        --l-border-width: 4px;
        --l-border-radius: 50%;
        --l-ease: cubic-bezier(0, 0.2, 0.8, 1);
        --l-duration: 1s;
        --l-delay: -0.5s;
        --t-border-radius: 4px;
        --height: 400px;
        --width: 400px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        display: block;
        margin: .25rem;
    }
    :host * {
        box-sizing: border-box;
    }
    .wow--container {
        color: var(--black);
        position: relative;
        background-color: var(--bg);
        border: 3px solid var(--black);
        border-radius: var(--t-border-radius);
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    /****************/
    .wow--loader {
        display: inline-block;
        position: absolute;
        width: var(--l-width);
        height: var(--l-height);
    }
    .wow--loader > div {
        position: absolute;
        border: var(--l-border-width) solid var(--l-border-color);
        opacity: 1;
        border-radius: var(--l-border-radius);
        animation: lds-ripple var(--l-duration) var(--l-ease) infinite;
    }
    .wow--loader > div:nth-child(2) {
        animation-delay: var(--l-delay);
    }
    .wow--loader::after {
        content: '';
        position:absolute;
        background-color: var(--bg);
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        height: var(--height);
        width: var(--width);
    }
    .wow--loading__false .wow--loader::after,
    .wow--loading__false .wow--loader {
        content: unset;
        display: none;
    }
    @keyframes lds-ripple {
        0% {
            top: 36px;
            left: 36px;
            width: 0;
            height: 0;
            opacity: 1;
        }
        100% {
            top: 0px;
            left: 0px;
            width: 72px;
            height: 72px;
            opacity: 0;
        }
    }

    /****************/
    .wow--table {
        border-collapse: collapse;
    }
    .wow--cell {
        border: 1px solid var(--black);
        text-align: center;
        font-variant-numeric: tabular-nums;
        padding: .25rem;
    }
    .wow--body .wow--row:hover {
        background-color: var(--bg-hover);
    }
</style>
<div class="wow--container">
    <div class="wow--loader"><div></div><div></div></div>
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
        this.json = this.hasAttribute('json') ? this.json : '';
        this.file = this.hasAttribute('file') ? this.file : '';
        this.titles = this.hasAttribute('titles') ? 1 : 0;
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

    CSVToJSON(csv, delimiter = ',') {
        csv = csv.split('').map(char => (char === '"' || char === ' ') ? '' : char).join('');

        const data = csv
            .split('\n')
            .map(v => v.split(delimiter));

        return {
            data
        };
    };

    loading(value) {
        this.setAttribute('loading', value);
        value === 'false' ? this.container.classList.add(`wow--loading__false`) : this.container.classList.remove(`wow--loading__false`);
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (name === 'file' && newVal !== null) {
            this.setAttribute('loading', true);
            this._getFile(newVal)
                .then(data => data.text())
                .then(text => this.checkDelimiter(text))
                .then(csv => this.CSVToJSON(csv))
                .then(json => this.buildTable(json.data))
                .then(_ => this.loading('false'));
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

        if (classList !== undefined && typeof classList === 'object') {
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
        this.clearTable();

        if (this.getAttribute('titles')) {

            /* grab the first array from the data array */
            /* MUTATES */
            const firstRow = data.splice(0, 1)[0];

            const header = this.buildEl({
                el: 'thead',
                classList: ['wow--head'],
                attrs: {
                    id: `wow--head-${this._genID(3)}`
                }
            });

            const hRow = this.buildEl({
                el: 'tr',
                classList: ['wow--row']
            })

            for (const title of firstRow) {
                const th = this.buildEl({
                    el: 'th',
                    classList: ['wow--cell', 'wow--head'],
                    content: title
                })
                hRow.appendChild(th);
                header.appendChild(hRow);
                this.table.appendChild(header);
            }
        }

        const body = this.buildEl({
            el: 'tbody',
            classList: ['wow--body'],
            attrs: {
                id: `wow--body-${this._genID(3)}`
            }
        });

        this.table.appendChild(body)

        for (const row of data) {
            const bRow = this.buildEl({
                el: 'tr',
                classList: ['wow--row']
            });

            const bCells = this.buildCells(row, bRow);

            body.appendChild(bCells);
        }
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