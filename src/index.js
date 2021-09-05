import "core-js/stable";
import { decode } from "he";
import "regenerator-runtime/runtime";
import { SearchService } from "./searchService.js";
import * as applyForm from "./applyForm.js";

const template = document.createElement('template');

template.innerHTML = `
<style>

.navigation {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
}

.navigation a {
    font-weight: 700;
    color: #2e55fa;
    cursor: pointer;
    margin: 20px;
    font-size: 1.2em;
}

header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

details {
    border: 0px solid #aaa;
    padding-top: 20px;
}

summary {
    word-wrap: break-word;
    overflow: hidden;
    max-height: 3.4em;
    line-height: 1.8em;
    width: 100%;
}

details[open] {
    padding: .5em;
}

details[open] summary {
    border-bottom: 1px solid #aaa;
    margin-bottom: .5em;
}

summary::marker {
    display: none;
    color: #2e55fa;
    content: 'view more ';
    text-decoration: underline;
    text-transform: capitalize;
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
    margin-top: 15px;
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
    flex-wrap: wrap;
    align-items: center;
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
    <div class="navigation">
        <a class="previous">Prev</a>
        <a class="next">Next</a>
    </div>
    <slot>
        <header>
            <h2 part="title">{{jobTitle}}</h2>
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
    <career-portal-apply></career-portal-apply>
</div>
`

export class CareerPortal extends HTMLElement {
    searchService;
    element;
    currentJobs;
    page;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(template.content.cloneNode(true));
        this.searchService = new SearchService(this.swimlane, this.corpToken);
        this.element = shadowRoot.querySelector('div');
        this.page = 0;
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
        const res = await this.searchService.getjobs('', {start: (this.page * this.jobsPerPage) + 1}, this.jobsPerPage);
        this.currentJobs = await res.json();
        this.createJobElement();
    }

    createJobElement() {
        this.removeDisplayedJobs();
        this.currentJobs.data.forEach(job => {
            const jobElement = document.createElement('div');
            jobElement.setAttribute('class', 'job');
            jobElement.appendChild(this.element.querySelector('slot').cloneNode(true));

            const jobSummary = decode(job.publicDescription.replace(/<.*?>/g, ''));
            jobElement.innerHTML = jobElement.innerHTML
            .replace('{{jobTitle}}', job.title)
            .replace('{{jobCategory}}', job.publishedCategory?.name)
            .replace('{{dateLastPublished}}', new Date(job.dateLastPublished).toLocaleDateString())
            .replace('{{jobSummary}}', jobSummary)
            .replace('{{jobDescription}}', job.publicDescription)
            .replace('{{employmentType}}', job.employmentType)
            .replace('{{address}}', `${job.address?.city}, ${job.address?.state}`)
            this.element.appendChild(jobElement);
            jobElement.querySelector('button').addEventListener('click', value => {
                this.openJob(job);
            });
        });
    }

    removeDisplayedJobs(){
        const elements = this.element.getElementsByClassName('job');
        while(elements.length > 0){
            elements[0].parentNode.removeChild(elements[0]);
        }
    }

    openJob(job) {
        this.element.querySelector('career-portal-apply').setAttribute('id', job.id)
        this.element.querySelector('career-portal-apply').setAttribute('title', job.title)
        this.element.querySelector('career-portal-apply').setAttribute('visible', 'true')
    }

    nextPage() {
        this.page += 1;
        this.setJobs();
    }

    previousPage() {
        this.page -= 1;
        this.setJobs();
    }

    updatePaginationButtons() {
        this.element.querySelector('.next').addEventListener('click', value => {
            this.nextPage();
        });
        this.element.querySelector('.previous').addEventListener('click', value => {
            this.previousPage();
        });
    }

    connectedCallback() {
        this.updatePaginationButtons();
    }
}

window.customElements.define('career-portal', CareerPortal);