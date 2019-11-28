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
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        display:block;
        margin: .25rem;
    }
    :host * {
        box-sizing: border-box;
    }
    .wow--container {
        color: var(--black);
        position:relative;
        background-color: var(--bg);
        border: 3px solid var(--black);
        border-radius: 4px;
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
        height: 100%;
        width: 100%;
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
    }

    _getFile(src) {
        return fetch(src);
    }

    CSVToJSON(csv, delimiter = ',') {
        console.log(csv.length);
        csv = csv.split('').map(char => (char === '"' || char === ' ') ? '' : char).join('');

        const titles = csv.slice(0, csv.indexOf('\n')).split(delimiter);
        const data = csv
            .slice(csv.indexOf('\n') + 1)
            .split('\n')
            .map(v => v.split(delimiter));

        return {
            titles,
            data
        };
    };

    static get observedAttributes() {
        return ['file', 'json', 'styles', 'loading'];
    }

    loading(value) {
        this.setAttribute('loading', value);
        value === 'false' ? this.container.classList.add(`wow--loading__false`) : this.container.classList.remove(`wow--loading__false`);
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (name === 'file' && newVal !== null) {
            this.setAttribute('loading', true);

            this._getFile(newVal)
                .then(data => data.text())
                .then(csv => this.CSVToJSON(csv))
                .then(json => this.buildTable(json))
                .then(_ => this.loading('false'));
        }
        if (name === 'styles') {

        }
    }

    make() {
        return {
            head: text => `<th class="wow--cell wow--head">${text}</th>`,
            cell: cell => `<td class="wow--cell">${cell}</td>`
        }
    }

    buildTable(json) {
        const { titles, data } = json;

        const template = document.createElement('template');

        template.innerHTML = `
        <thead class="wow--head">
            <tr class="wow--row">
                ${titles.map(this.make().head).join('')}
            </tr>
        </thead>
        <tbody class="wow--body">
            ${data.map(arr => `
                    <tr class="wow--row">${arr.map(this.make().cell).join('')}</tr>
                `).join('')}
        </tbody>
        `;
        const content = template.content.cloneNode(true);
        this.clearTable();
        this.table.appendChild(content);
    }

    clearTable() {
        const children = [...this.container.querySelectorAll('.wow--table > *')];
        for (const child of children) {
            this.table.removeChild(child);
        }
        //for (children in )
    }
}

window.customElements.define('wow-table', WowTable);