export class ApplyService {
    swimlane;
    corpToken;

    constructor(swimlane, corpToken) {
        this.swimlane = swimlane;
        this.corpToken = corpToken;
    }

    get baseUrl() {    
        return `https://public-rest${this.swimlane}.bullhornstaffing.com:443/rest-services/${this.corpToken}/apply`;
    }

    apply(id, params, formData, successCallBack, failCallback) {
        let applyParams = this.assembleParams(params);
        var http = new XMLHttpRequest();

        http.open('POST', `${this.baseUrl}/${id}/raw?${applyParams}`, true);

        http.onreadystatechange = ()=>{
            if(http.readyState == 4 && http.status == 200) {
                successCallBack();
            } else if(http.readyState == 4) {
                failCallback();
            }
        };
        http.send(formData);
    }
    
    assembleParams(data) {
        let params = [];
        params.push(`externalID=Resume`);
        params.push(`type=Resume`);
        for (let key in data) {
            if (!data.hasOwnProperty(key)) { continue; }
            if (!data[key]) { continue; }
            let value = data[key];
            params.push(`${key}=${value}`);
        }
        return params.join('&');
    }
    
}