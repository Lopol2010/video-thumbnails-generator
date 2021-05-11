import "./popup.sass"
let m = require('mithril')



function getTabId()
{
    
}


let App = {
    view: function () {
        return (
            <div>
                <p>
                    Enabled on this site?
                    <input type="checkbox" id="enabled" onclick ={ function () { console.log(getTabId()) } }/>
                </p>
            </div>
        )
    }
}


m.render(document.body, <App/>)