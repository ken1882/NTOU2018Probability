var plane, data = [], config, debtChart, chosenColor = [], mayorsIndex = [];
var toolbar;

function start(){
  plane = new Bitmap(0, 0, 800, 600);
  plane.render(document.getElementById("Plane"));
  Util.processJSON("data/debt.json", function(da){
    data = JSON.parse(da);
    ChartManager.initialize();
    createChart();
  });
  toolbar = document.getElementById("toolbar");
}

function createChart(){
  debtChart = new SChart(plane.canvas);
  drawChart();
}

function drawChart(){
  drawDebt();
  drawPaySingle();
  chosenColor = [ChartManager.color.Gold, ChartManager.color.Green, ChartManager.color.UltraDimGray,
    ChartManager.color.UltraDimGrey, ChartManager.color.Purple, ChartManager.color.Red, 
    ChartManager.color.Black]
  drawPayTotal();
  debtChart.start();
}

function pushButton(name, handler){
  let but = document.createElement("input");
  but.type = "checkbox"
  but.checked = true;
  if(!handler){handler = function(){};}
  but.onclick = function(){handler(but.checked)};
  let sp  = document.createElement("span");
  sp.innerText = name + ' ';
  toolbar.appendChild(but); toolbar.appendChild(sp);
}

function drawDebt(){
  let lbs = [], dats = [], lastMayor = '', ptSize = [];
  for(let i=0;i<data.length;++i){
    let m = ''
    if(data[i].mayor != lastMayor){
      m = data[i].mayor; lastMayor = m;
    }
    lbs.push([data[i].year + '年', m]);
    dats.push(data[i].debt);
    ptSize.push(5);
  }
  debtChart.appendDataset(dats);
  debtChart.setChartLabels(lbs);
  debtChart.changeDataLabel(0, '市府負債金額');
  debtChart.changeDataBorderColor(0, ChartManager.color.Gold);
  debtChart.changeDataXLabel(0, "年 (民國)");
  debtChart.changeDataYLabel(0, "金額 (億)");
  debtChart.changeDataTicks(0, -800, 2000);
  debtChart.changePointSize(0, ptSize);
  pushButton('市府負債金額', function(ok){
    if(ok){debtChart.showDataset(0);}
    else{debtChart.hideDataset(0);}
  });
}

function drawPaySingle(){
  let dats = [null];
  let ptStyle = [null], ptSize = [0];
  for(let i=0;i<data.length - 1;++i){
    let delta = (data[i].debt - data[i+1].debt).toFixed(2);
    dats.push(delta);
    if(delta >= 0){
      ptStyle.push('triangle')
    }
    else{
      ptStyle.push('rect')
    }
    ptSize.push(8);
  }
  debtChart.appendDataset(dats, null, null);
  debtChart.changeDataLabel(1, '年度還債額');
  debtChart.changeDataBackgroundColor(1, ChartManager.color.Green);
  debtChart.changeDataBorderColor(1, ChartManager.color.Purple);
  debtChart.changePointStyle(1, ptStyle);
  debtChart.changePointSize(1, ptSize);
  pushButton('年度還債額', function(ok){
    if(ok){debtChart.showDataset(1);}
    else{debtChart.hideDataset(1);}
  });
}

function drawPayTotal(){
  let dats = [null], temp, lastMayor = data[0].mayor, sum = 0, cnt = 2;
  let ptStyle = [null], ptSize = [0];
  
  for(let i=0;i<data.length;++i){
    if(i+1 == data.length || data[i+1].mayor != lastMayor){      
      sum = 0;
      temp = [];
      for(let j=0;j<dats.length;++j){
        if(dats[j]){dats[j] = parseFloat(dats[j]).toFixed(2)}
        temp.push(dats[j]);
      }

      debtChart.appendDataset(temp, null, null);
      debtChart.changeDataLabel(cnt, lastMayor + '還債額');

      let bc = ChartManager.randomColor(chosenColor);
      chosenColor.push(bc);
      debtChart.changeDataBackgroundColor(cnt, bc);

      bc = ChartManager.randomColor(chosenColor);
      chosenColor.push(bc);
      mayorsIndex.push(cnt);
      debtChart.changeDataBorderColor(cnt, bc);

      debtChart.changePointSize(cnt, ptSize);
      debtChart.changePointStyle(cnt, ptStyle);
      cnt += 1;
      if(i+1 == data.length){break;}
      lastMayor = data[i+1].mayor;
      for(let i=0;i<dats.length;++i){dats[i] = null;}
    }
    let delta = (data[i].debt - data[i+1].debt);
    sum += parseFloat(delta);
    console.log(i, delta);
    if(delta >= 0){
      ptStyle.push('triangle');
    }
    else{
      ptStyle.push('rect');
    }
    ptSize.push(8);
    dats.push(sum);
  }

  pushButton('各市長還債額(累加)', function(ok){
    for(let i=0;i<mayorsIndex.length;++i){
      let idx = mayorsIndex[i];
      if(ok){debtChart.showDataset(idx);}
      else{debtChart.hideDataset(idx);}
    }
  });
}
window.addEventListener("load", start, false);