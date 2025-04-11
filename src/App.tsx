
import './App.css'
import {useEffect, useState} from "react";
function App() {

    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    useEffect(() => {
        const listener = (msg:{type:string,data:string}) => {
            if (msg.type === "RESULT") {
                setStatus(msg.data)
                setLoading(false)

            }
        };

        chrome.runtime.onMessage.addListener(listener);

        return () => {
            chrome.runtime.onMessage.removeListener(listener);
        };
    },[])
    const scan = async ()=>{
        setLoading(true);
        const [tab] = await chrome.tabs.query({active:true})
        await chrome.scripting.executeScript({
            target: {tabId: tab.id!},
            func: () => {
                const target = document.getElementsByClassName("a3s")[0]
                if(target){
                    const job = target.textContent!.replaceAll(/[\s\u2000-\u200F\u00A0\u202F]+/g," ").trim()
                    chrome.runtime.sendMessage({
                        type:"JOB",
                        data:job
                    })
                }
            }

        })
    }
    const openSettings =()=>{
    setIsOpen(!isOpen)
    }
  return (
    <>
        <div id={"header"}><p>NOVAK Client v0.0.1</p> <img src="/settings-icon.svg" alt="setting-icon" id={"settings"} onClick={()=>openSettings()}/></div>
        <main>
            <div id="contant">
                <h1>NOVAK</h1>
                <button onClick={async ()=> await scan()} id={"scan-btn"}>Scan</button>
            </div>
            <div id={"circ"}
            style={{
                background: status === "" ? "radial-gradient(circle, rgba(96,181,255,1) 0%, rgba(0,243,255,1) 50%, rgba(0,243,255,0) 50%)" : status !== "Safe" ? "radial-gradient(circle,rgba(255, 226, 96, 1) 0%, rgba(255, 0, 0, 1) 50%, rgba(0, 243, 255, 0) 50%)":"radial-gradient(circle,rgba(96, 205, 255, 1) 0%, rgba(0, 255, 21, 1) 50%, rgba(0, 243, 255, 0) 50%)",
            }}
            ></div>
            {loading ? <div className={"loader"}></div> : <p id={"status"}>{status}</p>}
        </main>
        <SettingsPanal isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  )
}
interface SettingsPanalProps {
    isOpen: boolean,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}
const SettingsPanal = ({isOpen,setIsOpen}:SettingsPanalProps)=>{
    const [apiUrl,setApiUrl]=useState<string>("");
    const [apiKey,setApiKey]=useState<string>("");
    useEffect(() => {
        chrome.storage.local.get(["apiUrl","apiKey"],items => {
            if(items && items.apiUrl && items.apiKey){
                setApiUrl(items.apiUrl)
                setApiKey(items.apiKey)
            }
        })
    }, []);
    const saveSettings = async () => {
        await chrome.storage.local.set({"apiUrl": apiUrl, "apiKey": apiKey})
        setIsOpen(false)
    }
    return (isOpen && (
        <>
            <div id={"settingsPanal"}>
                <img id={"settingsClose"} src={"/close-icon.svg"} alt={"close"} onClick={()=>setIsOpen(false)}/>
                <p id={"settingTitle"}>Settings:</p>
                <p className={"label"}>Your Hivemind API URL:</p>
                <input type="text" value={apiUrl} className={"input"} placeholder={"API URL"} onChange={(e)=>setApiUrl(e.target.value)}/>
                <p className={"label"}>Your Hivemind API key:</p>
                <input type="password" className={"input"} placeholder={"API KEY"} value={apiKey} onChange={(e)=>setApiKey(e.target.value)}/>
                <div id={"buttonConatiner"}><button id={"saveBtn"} onClick={()=>saveSettings()}>Save</button></div>
            </div>
        </>
    ))
}

export default App
