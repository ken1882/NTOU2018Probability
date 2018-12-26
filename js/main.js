var plane, data = [], config, debtChart, chosenColor = [], mayorsIndex = [];
var plane_single, toolbar, selections;

function start(){
  plane = new Bitmap(0, 0, 800, 600);
  plane.render(document.getElementById("Plane"));
  plane_single = new Bitmap(0, 1000, 800, 600);
  plane_single.render(document.getElementById("PlaneSingle"))
  selections = document.getElementById("selections")
  selections.addEventListener("change", function(){drawSingleChart(selections.selectedOptions[0])});
  toolbar = document.getElementById("toolbar");

  Util.processJSON("data/debt.json", function(da){
    data = JSON.parse(da);
    ChartManager.initialize();
    createChart();
  });

}

function createChart(){
  debtChart = new SChart(plane.canvas);
  singleChart = new SChart(plane_single.canvas);
  drawChart();
}

function drawSingleChart(opt){
  let index = opt.value;
  if(index < 0){return ;}
  singleChart.setTitle(opt.text);
  let peak = getDataTick(parseInt(index));
  singleChart.changeDataTicks(0, peak[0], peak[1]);
  if(index == 2){
    for(let i=0;i<mayorsIndex.length;++i){
      let dat = Util.clone(debtChart.datasets[mayorsIndex[i]], false);
      singleChart.changeDataIndex(i, dat);
      singleChart.showDataset(i);
    }
  }
  else{
    while(singleChart.datasets.length > 1){singleChart.popData();}
    let dat = Util.clone(debtChart.datasets[index], false);
    singleChart.changeDataIndex(0, dat);
    singleChart.showDataset(0);
  }
  singleChart.update();
}

function drawChart(){
  drawDebt();
  drawPaySingle();
  chosenColor = [ChartManager.color.Gold, ChartManager.color.Green, ChartManager.color.UltraDimGray,
    ChartManager.color.UltraDimGrey, ChartManager.color.Purple, ChartManager.color.Red, 
    ChartManager.color.Black]
  drawPayTotal();
  drawIncome();
  drawOutcome();
  drawLoan();
  drawReturn();
  debtChart.start();
  singleChart.start();
}

function pushButton(name, index, handler){
  let but = document.createElement("input");
  but.type = "checkbox"
  but.checked = true;
  but.index = index;
  if(!handler){handler = function(){};}
  but.addEventListener('change', function(){handler(but.checked)});
  let sp  = document.createElement("span");
  sp.innerText = name + ' ';
  toolbar.appendChild(but); toolbar.appendChild(sp);

  let option = document.createElement("option");
  option.value = index;
  option.text = name;
  selections.add(option);
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

  singleChart.appendDataset(dats);
  singleChart.setChartLabels(lbs);
  singleChart.changeDataLabel(0, '市府負債金額');
  singleChart.changeDataBorderColor(0, ChartManager.color.Gold);
  singleChart.changeDataXLabel(0, "年 (民國)");
  singleChart.changeDataYLabel(0, "金額 (億)");
  singleChart.changeDataTicks(0, 0, 2000);
  singleChart.changePointSize(0, ptSize);

  pushButton('市府負債金額', 0, function(ok){
    onToggle(0, ok);
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
  pushButton('年度還債額', 1, function(ok){
    onToggle(1, ok);
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
    
    if(delta >= 0){
      ptStyle.push('triangle');
    }
    else{
      ptStyle.push('rect');
    }
    ptSize.push(8);
    dats.push(sum);
  }

  pushButton('各市長還債額(累加)', 2, function(ok){
    for(let i=0;i<mayorsIndex.length;++i){
      let index = mayorsIndex[i];
      onToggle(index, ok);
    }
  });
}

function drawIncome(){
  let dats = [], ptSize = [];
  for(let i=0;i<data.length;++i){
    if(data[i].income){
      let n = parseFloat(data[i].income).toFixed(2);
      dats.push(n);
    }
    else{dats.push(null);}
    ptSize.push(5);
  }
  let index = debtChart.datasets.length;
  debtChart.appendDataset(dats, null, null);
  debtChart.changeDataLabel(index, '年度總收入');

  let bc = ChartManager.randomColor(chosenColor);
  chosenColor.push(bc);
  debtChart.changeDataColor(index, bc);
  debtChart.changePointSize(index, ptSize);
  pushButton('年度總收入', index, function(ok){
    onToggle(index, ok);
  });
}

function drawOutcome(){
  let dats = [], ptSize = [];
  for(let i=0;i<data.length;++i){
    if(data[i].outcome){
      let n = parseFloat(data[i].outcome).toFixed(2);
      dats.push(n);
    }
    else{dats.push(null);}
    ptSize.push(5);
  }
  let index = debtChart.datasets.length;
  debtChart.appendDataset(dats, null, null);
  debtChart.changeDataLabel(index, '年度總支出');

  let bc = ChartManager.randomColor(chosenColor);
  chosenColor.push(bc);
  debtChart.changeDataColor(index, bc);
  debtChart.changePointSize(index, ptSize);
  pushButton('年度總支出', index, function(ok){
    onToggle(index, ok);
  });
}

function drawLoan(){
  let dats = [], ptSize = [];
  for(let i=0;i<data.length;++i){
    if(data[i].loan){
      let n = parseFloat(data[i].loan).toFixed(2);
      dats.push(n);
    }
    else{dats.push(null);}
    ptSize.push(5);
  }
  let index = debtChart.datasets.length;
  debtChart.appendDataset(dats, null, null);
  debtChart.changeDataLabel(index, '舉債金額');

  let bc = ChartManager.randomColor(chosenColor);
  chosenColor.push(bc);
  debtChart.changeDataColor(index, bc);
  debtChart.changePointSize(index, ptSize);
  pushButton('舉債金額', index, function(ok){
    onToggle(index, ok);
  });
}

function drawReturn(){
  let dats = [], ptSize = [];
  for(let i=0;i<data.length;++i){
    if(data[i].return){
      let n = parseFloat(data[i].return).toFixed(2);
      dats.push(n);
    }
    else{dats.push(null);}
    ptSize.push(5);
  }
  let index = debtChart.datasets.length;
  debtChart.appendDataset(dats, null, null);
  debtChart.changeDataLabel(index, '還本金額');

  let bc = ChartManager.randomColor(chosenColor);
  chosenColor.push(bc);
  debtChart.changeDataColor(index, bc);
  debtChart.changePointSize(index, ptSize);
  pushButton('還本金額', index, function(ok){
    onToggle(index, ok);
  });
}

function onToggle(index, ok){
  if(index == 2){
    for(let i=0;i<mayorsIndex.length;++i){
      if(ok){debtChart.showDataset(mayorsIndex[i]);}
      else{debtChart.hideDataset(mayorsIndex[i]);}
    }
  }
  else{
    if(ok){debtChart.showDataset(index);}
    else{debtChart.hideDataset(index);}
  }
}

window.addEventListener("load", start, false);

function checkAll(){
  let ar = document.getElementsByTagName("input");
  for(let i=0;i<ar.length;++i){
    if(ar[i].type == 'checkbox'){
      ar[i].checked = true;
      onToggle(ar[i].index, true);
    }
  }
  if(debtChart){debtChart.update();}
}

function uncheckAll(){
  let ar = document.getElementsByTagName("input");
  for(let i=0;i<ar.length;++i){
    if(ar[i].type == 'checkbox' && ar[i].index !== undefined){
      ar[i].checked = false;
      onToggle(ar[i].index, false);
    }
  }
  if(debtChart){debtChart.update();}
}

function getDataTick(index){
  switch(index){
  case 0:
    return [0, 2000];
  case 1:
    return [-300, 300];
  case 2:
    return [-1000, 1000];
  case 7:
  case 8:
    return [0, 2000];
  case 9:
  case 10:
    return [0, 500];
  }
  return [-500, 2000];
}