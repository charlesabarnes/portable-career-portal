import "core-js/stable";
import "regenerator-runtime/runtime";
import { SearchService } from "./searchService.js";

const template = document.createElement('template');

template.innerHTML = `
<style>
details {
    border: 1px solid #aaa;
    border-radius: 4px;
    padding: .5em .5em 0;
}

summary {
    font-weight: bold;
    margin: -.5em -.5em 0;
    padding: .5em;
}

details[open] {
    padding: .5em;
}

details[open] summary {
    border-bottom: 1px solid #aaa;
    margin-bottom: .5em;
}

div {
    font-family: sans-serif;
}

div.job {
    border-radius: 5px;
    border-style: solid;
    border-width: 1;
    padding: 20px;
    margin: 20px;
    border-color: #F4F4F4;
    box-shadow: 0 0 10px 0 rgb(0 24 128 / 10%);
}

button {
    padding: 15px 50px;
    margin: 15px 0;
    font-weight: 700;
    font-size: 1.2em;
    background-color: #e1e7ff;
    border: none;
    cursor: pointer;
    border-radius: 5px;
    color: #2e55fa;
}

button:hover {
    background-color: #2e55fa;
    color: #e1e7ff;
}

.chips {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
}

.chips span {
    line-height: 1.5;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    list-style: none;
    box-sizing: border-box;
    border-radius: 4px;
    background-color: #e1e7ff;
    font-size: 15px;
    padding: 2px 10px;
    display: inline-block;
    text-align: center;
    transition: all .5s;
    font-family: roboto;
    text-transform: capitalize;
    margin-bottom: 5px;
    color: #2e55fa;
    margin: 10px;
}


footer {
    display: flex;
    justify-content: flex-end;
}

</style>
<div>
    <slot>
        <header>
            <h3 part="title">{{jobTitle}}</h3>
            <div class="chips">
                <span part="category">{{jobCategory}}</span>
                <span part="employmentType">{{employmentType}}</span>
                <span part="address">{{address}}</span>
                <span part="pubDate">{{dateLastPublished}}</span>
            </div>
        </header>
        <main>
        <details part="details">
            <summary>{{jobSummary}}</summary>
            <p part="description">{{jobDescription}}</p>
        </details>
        </main>
        <footer>
            <button part="applyBtn">Apply</button>
        </footer>
    </slot>
</div>
`

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
        return [ 'corpToken', 'swimlane', 'jobsPerPage' ];
    }

    get corpToken() {
        return this.getAttribute('corpToken');
    }

    get swimlane() {
        return this.getAttribute('swimlane');
    }

    get jobsPerPage() {
        return this.getAttribute('jobsPerPage');
    }


    async setJobs() {
        const res = await this.searchService.getjobs('', {}, this.jobsPerPage);
        this.currentJobs = await res.json();
        this.createJobElement();
    }

    createJobElement() {
        this.currentJobs.data.forEach(job => {
            const jobElement = document.createElement('div');
            jobElement.setAttribute('class', 'job');
            jobElement.appendChild(this.element.querySelector('slot').cloneNode(true));

            jobElement.innerHTML = jobElement.innerHTML
            .replace('{{jobTitle}}', job.title)
            .replace('{{jobCategory}}', job.publishedCategory?.name)
            .replace('{{dateLastPublished}}', new Date(job.dateLastPublished).toLocaleDateString())
            .replace('{{jobSummary}}', 'View Description')
            .replace('{{jobDescription}}', job.publicDescription)
            .replace('{{employmentType}}', job.employmentType)
            .replace('{{address}}', `${job.address?.city}, ${job.address?.state}`)
            this.element.appendChild(jobElement);
            jobElement.querySelector('button').addEventListener('click', value => {
                this.openJob(job.id);
            });
        });
    }

    openJob(itemId) {
        console.log(itemId);
    }

    connectedCallback() {
    }
}

window.customElements.define('career-portal', CareerPortal);