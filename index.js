import { SearchService } from "./searchService.js";

const template = document.createElement('template');

template.innerHTML = `
<div></div>`

export class CareerPortal extends HTMLElement {
    searchService;
    element;
    currentJobs;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(template.content.cloneNode(true));
        this.searchService = new SearchService(this.swimlane, this.corpToken);
        this.element = shadowRoot.querySelector('div');
        this.setJobs();
    }

    static get observedAttributes() {
        return [ 'corpToken', 'swimlane' ];
    }

    get corpToken() {
        return this.getAttribute('corpToken');
    }

    get swimlane() {
        return this.getAttribute('swimlane');
    }

    async setJobs() {
        const res = await this.searchService.getjobs('');
        this.currentJobs = await res.json();
        this.element.innerHTML = JSON.stringify(this.currentJobs);
    }

    createJobElement() {

    }

    connectedCallback() {
    }
}

window.customElements.define('career-portal', CareerPortal);