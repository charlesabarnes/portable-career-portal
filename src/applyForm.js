import { ApplyService } from "./applyService";

const applyTemplate = document.createElement('template');

applyTemplate.innerHTML = `
<style>

.wrapper, .success-wrapper {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: gray;
    opacity: 0;
    visibility: hidden;
    transform: scale(1.1);
    transition: visibility 0s linear .25s,opacity .25s 0s,transform .25s;
    z-index: 1;
  }
  .visible {
    opacity: 1;
    visibility: visible;
    transform: scale(1);
    transition: visibility 0s linear 0s,opacity .25s 0s,transform .25s;
  }
  .modal, .success {
    padding: 10px 10px 5px 10px;
    background-color: #fff;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    border-radius: 2px;
    min-width: 300px;
    min-width: 50vw;
  }

  .success {
    color: #2e55fa;
    background-color: #e1e7ff;
    text-align: center;
  }

.input-container {
    position:relative;
    display: flex;
    margin: 20px;
    padding: 20px
}

.input-container label {
    -webkit-text-size-adjust: 100%;
    font-family: Roboto,sans-serif;
    box-sizing: border-box;
    color: #3d464d;
    font-size: .9em;
    font-weight: 500;
    text-transform: uppercase;
    position: absolute;
    left: 22px;
    pointer-events: none;
    z-index: 1;
    width: 100%;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow-x: hidden;
    transform: translateY(0);
    transform-origin: bottom left;
    transition: transform .4s cubic-bezier(.25,.8,.25,1),scale .4s cubic-bezier(.25,.8,.25,1),color .4s cubic-bezier(.25,.8,.25,1),width .4s cubic-bezier(.25,.8,.25,1);
    display: block;
    cursor: text;
    top: 27px;
    bottom: 0;
}

.input-container label.active, .input-container label.filled  {
    display: block;
    transform: translateY(-100%)
    height: 1.5em;
    top: 0;
}

input {
    font: inherit;
    line-height: normal;
    font-size: 1em;
    background: 0 0!important;
    border: none;
    border-bottom: 1px solid #afb9c0;
    border-radius: 0;
    outline: 0;
    height: 2rem;
    width: 100%;
    margin: 0;
    padding: 0;
    box-shadow: none;
    box-sizing: content-box;
    transition: all .3s;
    color: #26282b;
    flex: 1;
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


.button-container {
    display: flex;
    justify-content: flex-end;
}

.button-container button {
    margin: 15px;
}

.header {
    background-color: #e1e7ff;
    color: #2e55fa;
    margin: -10px;
    margin-top: -30px;
}

.title {
    width: 100%;
    text-align: center;
    font-weight: 700;
    padding: 50px 0;
    font-size: 25px;
}

label b {
    color: #DA4453;
}

</style>
<div class='wrapper'>
    <div class='modal'>
        <div class="header">
            <h2 class='title'>Apply to {{title}}</h2>
        </div>
        <div class='content'>
            <form enctype="multipart/form-data">
                <div class="input-container">
                    <label for="firstName">First name<b>*</b></label><br>
                    <input type="text" id="firstName" name="firstName" required><br>
                </div>
                <div class="input-container">
                    <label for="lastName">Last name<b>*</b></label><br>
                    <input type="text" id="lastName" name="lastName" required><br>
                </div>
                <div class="input-container">
                    <label for="email">Email<b>*</b></label><br>
                    <input type="email" id="email" name="email" required><br>
                </div>
                <div class="input-container">
                    <label for="phone">Mobile Phone</label><br>
                    <input type="tel" id="phone" name="phone" ><br>
                </div>

                <div class="input-container">
                <label for="resume" class="active">Resume<b>*</b></label><br>
                <input type="file" name="resume" id="resume" data-feature-id="resume">
                </div>

            </form> 
        </div>
        <div class='button-container'>
            <button class="cancel">Cancel</button>
            <button class="apply">Apply</button>
        </div>
    </div>
</div>
<div class="success-wrapper">
    <div class="success">
        <h1>Application was Successful</h1>
        <p>A recruiter will reach out to you shortly.</p>
    </div>

</div>
`

export class ApplyForm extends HTMLElement {
    applyService;
    element;
    currentJobs;
    page;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(applyTemplate.content.cloneNode(true));
        this.element = shadowRoot.querySelector('div.wrapper');
        this.setFocusEvents();
        this.setClickEvents();
    }

    static get observedAttributes() {
        return [ 'id', 'visible', 'title', 'corpToken', 'swimlane' ];
    }

    get jobId() {
        return this.getAttribute('id');
    }

    get title() {
        return this.getAttribute('title');
    }

    get corpToken() {
        return this.getAttribute('corpToken');
    }

    get swimlane() {
        return this.getAttribute('swimlane');
    }

    setFocusEvents() {
        const fields = ['firstName', 'lastName', 'email', 'phone'];
        fields.forEach((field)=> {
            this.element.querySelector(`#${field}`).addEventListener('focus', (event) => {
                this.element.querySelector(`label[for="${field}"]`).classList.add('active')
            });
            this.element.querySelector(`#${field}`).addEventListener('blur', (event) => {
                if (!event.target.value) {
                    this.element.querySelector(`label[for="${field}"]`).classList.remove('active')
                }
            });
        });
    }

    setClickEvents() {
        this.element.querySelector(`.cancel`).onclick = (event) => {
            event.stopPropagation();
            this.element.classList.remove('visible');
        };
        this.element.querySelector(`.apply`).onclick = (event) => {
            this.submitForm();
        };
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "visible" && this.shadowRoot) {
          if (newValue === null) {
            this.shadowRoot.querySelector(".wrapper").classList.remove("visible");
          } else {
            this.shadowRoot.querySelector(".wrapper").classList.add("visible");
          }
        }
        if (name === "title") {
            this.element.innerHTML = this.element.innerHTML.replace('{{title}}', newValue);
        }
        if (name === 'swimlane' || name === 'corpToken') {
            this.applyService = new ApplyService(this.swimlane, this.corpToken, this.element);
        }
        this.setClickEvents();
        this.setFocusEvents();
    }

    submitForm() {
        const formData = new FormData(this.element.querySelector('form'));
        var data = {};
        for (var key of formData.keys()) {
            if (key === 'resume') {
                const resumeData = formData.get(key);
                data['format'] = resumeData.name.substring(resumeData.name.lastIndexOf('.') + 1)
            } else {
                data[key] = formData.get(key);
            }
        }
        const callBack = function() {
            this.element.classList.remove("visible");
            this.shadowRoot.querySelector(".success-wrapper").classList.add("visible");
            setTimeout(()=> {
                this.shadowRoot.querySelector(".success-wrapper").classList.remove("visible");
            }, 5000);
        }

        const failCallback = function() {
            alert('error submitting resume. Please correct your data and try again.');
        }

        this.applyService.apply(this.jobId, data, formData, callBack.bind(this), failCallback);
    }

    connectedCallback() {
    }

}

window.customElements.define('career-portal-apply', ApplyForm);