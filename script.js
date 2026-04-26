function generateTables(){
    let p=parseInt(document.getElementById("processes").value);
    let r=parseInt(document.getElementById("resources").value);
    document.getElementById("maxMatrix").innerHTML=createTable(p,r);
    document.getElementById("allocationMatrix").innerHTML=createTable(p,r);
    document.getElementById("requestMatrix").innerHTML=createTable(p,r);
    createAvailableInputs(r);
    document.getElementById("outputText").textContent="Tables Generated";
}

function createAvailableInputs(r){
    let html="";
    for(let i=0;i<r;i++) html+=`R${i}: <input type="number" value="1"> `;
    document.getElementById("availableInput").innerHTML=html;
}

function createTable(rows,cols){
    let html="<table>";
    for(let i=0;i<rows;i++){
        html+="<tr>";
        for(let j=0;j<cols;j++) html+=`<td><input type="number" value="0" min="0"></td>`;
        html+="</tr>";
    }
    html+="</table>";
    return html;
}

function getMatrixValues(id){
    let matrix=[];
    document.querySelectorAll(`#${id} tr`).forEach(row=>{
        let arr=[];
        row.querySelectorAll("input").forEach(i=>{  arr.push(parseInt(i.value)||0);  });
        matrix.push(arr);
    });
    return matrix;
}

function getAvailable(){
    let arr=[];
    document.querySelectorAll("#availableInput input").forEach(i=>arr.push(parseInt(i.value)||0));
    return arr;
}

function calculateNeed(){
    let max=getMatrixValues("maxMatrix");
    let allocation=getMatrixValues("allocationMatrix");
    let need=[];
    for(let i=0;i<max.length;i++){
        let row=[];
        for(let j=0;j<max[i].length;j++) row.push(max[i][j]-allocation[i][j]);
        need.push(row);
    }
    displayMatrix(need,"Need Matrix");
    runBanker(max,allocation,need);
    drawGraph();
}

function displayMatrix(matrix,title){
    let html=`${title}\n`;
    matrix.forEach(r=>{  html+=r.join("   ")+"\n";  });
    document.getElementById("outputText").textContent=html;
}

function runBanker(max,allocation,need){
    let available=getAvailable();
    let finish=new Array(max.length).fill(false);
    let seq=[];
    let changed=true;
    while(changed){
        changed=false;
        for(let i=0;i<max.length;i++){
            if(!finish[i] && canRun(i,need,available)){
                for(let j=0;j<available.length;j++) available[j]+=allocation[i][j];
                finish[i]=true;
                seq.push("P"+i);
                changed=true;
            }
        }
    }
    if (finish.every(v=>v)) document.getElementById("outputText").textContent+=`\nSAFE SEQUENCE:\n${seq.join(" → ")}`;
    else document.getElementById("outputText").textContent+=`\nSystem NOT SAFE`;
}

function canRun(i,need,available){
    for(let j=0;j<available.length;j++) if(need[i][j]>available[j]) return false;
    return true;
}

function drawGraph(){
    let allocation=getMatrixValues("allocationMatrix");
    let canvas=document.getElementById("graphCanvas");
    let ctx=canvas.getContext("2d");
    canvas.width=500;
    canvas.height=400;
    ctx.clearRect(0,0,500,400);
    let pX=120;
    let rX=380;
    let processes=allocation.length;
    let resources=allocation[0].length;
    for(let i=0;i<processes;i++){
        ctx.beginPath();
        ctx.arc(pX,60+i*70,20,0,2*Math.PI);
        ctx.stroke();
        ctx.fillText("P"+i,pX-10,65+i*70); 
    }
    for(let j=0;j<resources;j++){
        ctx.strokeRect(rX-20,60+j*70-20,40,40);
        ctx.fillText("R"+j,rX-10,65+j*70);
    }
    for(let i=0;i<processes;i++){
        for(let j=0;j<resources;j++){
            if(allocation[i][j]>0){
                ctx.beginPath();
                ctx.moveTo(pX+20,60+i*70);
                ctx.lineTo(rX-20,60+j*70);
                ctx.stroke();
            }
        }
    }
}

function detectDeadlock(){
    let allocation=getMatrixValues("allocationMatrix");
    let request=getMatrixValues("requestMatrix");
    let graph={};
    for (let i=0;i<allocation.length;i++)  graph["P"+i]=[];
    for(let i=0;i<allocation.length;i++){
        for(let j=0;j<allocation[i].length;j++){
            if(request[i][j]>0){
                for(let k=0;k<allocation.length;k++){
                    if(allocation[k][j]>0){
                        graph["P"+i].push("P"+k);
                    }
                }
            }
        }
    }
    let cycle=findCycle(graph);
    if(cycle){
        document.getElementById("outputText").textContent+=`\nDEADLOCK:\n${cycle.join(" → ")}`;
        suggestRecovery(cycle);
        highlight();
    }else{
        document.getElementById("outputText").textContent+=`\nNo Deadlock`;
    }
}

function findCycle(graph){
    let visited={};
    let stack={};
    for(let node in graph){
        let path=[];
        if(dfs(node,graph,visited,stack,path)) return path;
    }
    return null;
}

function dfs(node,graph,visited,stack,path){
    if(!visited[node]){
        visited[node]=true;
        stack[node]=true;
        path.push(node);
        for(let n of graph[node]){
            if(!visited[n] && dfs(n,graph,visited,stack,path)) return true;
            else if(stack[n]){
                path.push(n);
                return true;
            }
        }
    }
    stack[node]=false;
    path.pop();
    return false;
}

function suggestRecovery(cycle){
    document.getElementById("outputText").textContent+=`\nRecovery Suggestion:\nTerminate ${cycle[0]}`;
}

function highlight(){
    let ctx=document.getElementById("graphCanvas").getContext("2d");
    ctx.fillStyle="red";
    ctx.fillText("Deadlock!",200,20);
}

function clearAll(){
    // reset matrix inputs
    document.querySelectorAll("table input").forEach(input=>input.value=0);
    // reset available resources
    document.querySelectorAll("#availableInput input").forEach(input=>input.value=0);
    // clear output
    document.getElementById("outputText").textContent="System Reset";
    // clear graph
    let canvas=document.getElementById("graphCanvas");
    let ctx=canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);
}