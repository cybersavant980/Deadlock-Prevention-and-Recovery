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