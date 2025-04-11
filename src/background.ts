// console.log("hi")
let CLIENT_UUID: string;
const mainLoop = async (result: { apiKey: string; apiUrl: string; },job:string) => {
    // console.log(result)
    const CLIENT_HEADERS = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "x-hivemind-key":result.apiKey
    }
    const REGISTER_URL = result.apiUrl+"/api/client/register"
    const JOB_REQ_URL = result.apiUrl+"/api/job/request"

    const REGISTER_PAYLOAD = {
        "uuid":CLIENT_UUID,
    }
    try {
        const initReq = await fetch(REGISTER_URL,{
            method: "POST",
            headers: CLIENT_HEADERS,
            body: JSON.stringify(REGISTER_PAYLOAD)
        })

        if(!initReq || !initReq.ok) {
            console.error("ERROR REGISTERING")
            await chrome.runtime.sendMessage({
                type: "RESULT",
                data:"ERROR REGISTERING"
            })
            return
        }
    }catch (e){
        console.error("ERROR NETWORK",e)
        await chrome.runtime.sendMessage({
            type: "RESULT",
            data:"ERROR NETWORK"
        })
        return
    }
    const JOB_UUID = crypto.randomUUID()
    const JOB_REQ_PAYLOAD = {
        uuid:JOB_UUID,
        clientuuid:CLIENT_UUID,
        workeruuid:null,
        state:"waiting",
        job:job
    }
    const jobReq = await fetch(JOB_REQ_URL,{
        method: "POST",
        headers: CLIENT_HEADERS,
        body: JSON.stringify(JOB_REQ_PAYLOAD)
    })
    // console.log(jobReq.status)
    if(jobReq.status !== 200){
        console.error("ERROR JOB_REQ")
        await chrome.runtime.sendMessage({
            type: "RESULT",
            data:"ERROR JOB_REQ"
        })
        return
    }

    const JOB_STATE_URL = result.apiUrl+"/api/job/"+JOB_UUID

    const intervalID = setInterval(async () => {
        const jobState = await fetch(JOB_STATE_URL)
        if(jobState.status == 200){
            const body = await jobState.json()
            if(body.data.state === "done"){
                await chrome.runtime.sendMessage({
                    type: "RESULT",
                    data: body.data.result
                })
                clearInterval(intervalID)
            }
        }else {
            console.error("ERROR JOB_STATE")
            await chrome.runtime.sendMessage({
                type: "RESULT",
                data: "ERROR JOB_STATE"
            })
            clearInterval(intervalID)
            return

        }
    },1000)
}


const init = async (job:string) => {
    chrome.storage.local.get(["UUID"], (result) => {
        if(result && result.UUID){
            CLIENT_UUID = result.UUID
        }else{
            CLIENT_UUID = crypto.randomUUID()
            chrome.storage.local.set({"UUID": CLIENT_UUID})
        }
    })
    chrome.storage.local.get(["apiUrl","apiKey"], async (result:{apiUrl:string,apiKey:string}) => {
        if(result && result.apiUrl && result.apiKey){
            await mainLoop(result, job)
        }
    })
}
chrome.runtime.onMessage.addListener(async (request) => {
    if(request.type === "JOB"){
        // console.log(request);
        await init(request.data)
    }
    return true
})