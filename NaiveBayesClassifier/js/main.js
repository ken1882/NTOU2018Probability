var data = {}, ready = false, weightData = {"male": {}, "female": {}}, heightData = {"male": {}, "female": {}};
var dataAvgHeight = {"male": {}, "female": {}}, dataAvgWeight = {"male": {}, "female": {}};
var maleFactor = 1, femaleFactor = 1;
var maleAvgBMI = 24.65, femaleAvgBMI = 24.0;
var variance = {}, exp = {}, scale = {};

var ge, he, we, re;

function start(){
  loadData();
  ge = document.getElementById("gender");
  he = document.getElementById("he");
  we = document.getElementById("we");
  re = document.getElementById("result");
}

window.addEventListener("load", start, false);


function loadData(){
  Util.processJSON("data/weight.json", function(dat){
    data.weight = JSON.parse(dat);
  });
  Util.processJSON("data/height.json", function(dat){
    data.height = JSON.parse(dat);
  });

  let wait = function(){
    if(data.height && data.weight){
      calculate();
    }
    else{setTimeout(wait, 500);}
  };
  setTimeout(wait, 500);
}

function calculate(){
  calculateAge();
  calcDataAvg();
  calcFactor(1.037374);
  calcVariance();
}

function calculateAge(){
  for(let i=0;i<data.height.length;++i){
    let key = parseInt(data.height[i]["年齡"]);
    if(!weightData.male[key]){weightData.male[key] = [];}
    if(!weightData.female[key]){weightData.female[key] = [];}
    if(!heightData.male[key]){heightData.male[key] = [];}
    if(!heightData.female[key]){heightData.female[key] = [];}
    weightData.male[key].push(parseFloat(data.weight[i]["男"]));
    weightData.female[key].push(parseFloat(data.weight[i]["女"]));
    heightData.male[key].push(parseFloat(data.height[i]["男"]));
    heightData.female[key].push(parseFloat(data.height[i]["女"]));
  }
  
  
}

function calcDataAvg(){
  let sum = 0, n = 0;
  for(let p in weightData.male){
    sum = 0; n = 0;
    if(weightData.male.hasOwnProperty(p)){
      for(let i=0;i<weightData.male[p].length;++i){
        sum += parseFloat(weightData.male[p][i]);
        n += 1;
      }
      dataAvgWeight.male[p] = (sum / n);
    }
  }
  
  for(let p in weightData.female){
    sum = 0, n = 0;
    if(weightData.female.hasOwnProperty(p)){
      for(let i=0;i<weightData.female[p].length;++i){
        sum += parseFloat(weightData.female[p][i]);
        n += 1;
      }
      dataAvgWeight.female[p] = (sum / n);
    }
  }
  
  for(let p in heightData.male){
    sum = 0, n = 0;  
    if(heightData.male.hasOwnProperty(p)){
      for(let i=0;i<heightData.male[p].length;++i){
        sum += parseFloat(heightData.male[p][i]);
        n += 1;
      }
      dataAvgHeight.male[p] = (sum / n);
    }
  }
  
  for(let p in heightData.female){
    sum = 0, n = 0;
    if(heightData.female.hasOwnProperty(p)){
      for(let i=0;i<heightData.female[p].length;++i){
        sum += parseFloat(heightData.female[p][i]);
        n += 1;
      }
      dataAvgHeight.female[p] = (sum / n);
    }
  }
  
  
}

function calcFactor(div = 1.0085){
  let s = 0, cnt = 0;

  for(let p in dataAvgHeight.male){
    if(dataAvgHeight.male.hasOwnProperty(p)){
      s += dataAvgHeight.male[p] / (getAvgHeight(parseInt(p), 'male'));
      cnt += 1;
    }
  }
  maleFactor = s / cnt / div;
  s = 0; cnt = 0;
  for(let p in dataAvgHeight.female){
    if(dataAvgHeight.female.hasOwnProperty(p)){
      s += dataAvgHeight.female[p] / (getAvgHeight(parseInt(p), 'female'));
      cnt += 1;
    }
  }
  femaleFactor = s / cnt / div;
}

function getAvgHeight(age, gender){
  if(gender == "male"){
    return maleFactor * Math.max(calcGrowth(age, 'male'), calcGrowth(age, 'female'));
  }
  else{
    return femaleFactor * Math.min(calcGrowth(age, 'male'), calcGrowth(age, 'female'));
  }
}

function calcGrowth(age, gender){
  if(gender == "male"){
    let h1 = 76.4 - 19.4 * Math.pow(Math.E, -1.56 * Math.min(age, 5));
    let h3 = 16.1 / (1 + Math.pow(Math.E, 16.4 - 1.2 * Math.min(age, 50)));
    age = Math.min(age, 20);
    let h2 = -0.235 * age * age + 9.5 * age - 4.7;
    return (h1 + h2 + h3);
  }
  else{
    let h1 = 74.3 - 18.7 * Math.pow(Math.E, -1.65 * Math.min(age, 5));
    let h3 = 8.6 / (1 + Math.pow(Math.E, 12.4 - 1.1 * Math.min(age, 50)));
    age = Math.min(age, 20);
    let h2 = -0.256 * age * age + 9.8 * age - 4.8;
    return (h1 + h2 + h3);
  }
}

function getAvgWeight(age, gender){
  if(gender == "male"){
    let h = Math.pow(getAvgHeight(age, gender) / 100, 2);
    return maleFactor * h * maleAvgBMI;
  }
  else{
    let h = Math.pow(getAvgHeight(age, gender) / 100, 2);
    return femaleFactor * h * femaleAvgBMI;
  }
}

function calcVariance(){
  variance.male = {height: Math.sqrt(6.3), weight: Math.sqrt(10.1)};
  variance.female = {height: Math.sqrt(5.4), weight: Math.sqrt(9.26857143)};
  scale = {
    male: {
      height: (1 / variance.male.height * Math.sqrt(2 * Math.PI)),
      weight: (1 / variance.male.weight * Math.sqrt(2 * Math.PI)),
    },
    female: {
      height: (1 / variance.female.height * Math.sqrt(2 * Math.PI)),
      weight: (1 / variance.female.weight * Math.sqrt(2 * Math.PI)),
    }
  };
}

function determineResult(w, h, a){
  let mhp = scale.male.height * Math.pow(Math.E, -1 * Math.pow(h - getAvgHeight(a, 'male'), 2) / (2 * Math.pow(variance.male.height, 2)));
  let mwp = scale.male.weight * Math.pow(Math.E, -1 * Math.pow(w - getAvgWeight(a, 'male'), 2) / (2 * Math.pow(variance.male.weight, 2)));
  let fhp = scale.female.height * Math.pow(Math.E, -1 * Math.pow(h - getAvgHeight(a, 'female'), 2) / (2 * Math.pow(variance.female.height, 2)));
  let fwp = scale.female.weight * Math.pow(Math.E, -1 * Math.pow(w - getAvgWeight(a, 'female'), 2) / (2 * Math.pow(variance.female.weight, 2)));  
  let mp = mhp * mwp, fp = fhp * fwp;
  return (mp > fp) ? 'male' : 'female';
}

function judge(){
  let w = parseFloat(we.value), h = parseFloat(he.value), a = parseInt(ag.value);
  
  let mhp = scale.male.height * Math.pow(Math.E, -1 * Math.pow(h - getAvgHeight(a, 'male'), 2) / (2 * Math.pow(variance.male.height, 2)));
  let mwp = scale.male.weight * Math.pow(Math.E, -1 * Math.pow(w - getAvgWeight(a, 'male'), 2) / (2 * Math.pow(variance.male.weight, 2)));
  let fhp = scale.female.height * Math.pow(Math.E, -1 * Math.pow(h - getAvgHeight(a, 'female'), 2) / (2 * Math.pow(variance.female.height, 2)));
  let fwp = scale.female.weight * Math.pow(Math.E, -1 * Math.pow(w - getAvgWeight(a, 'female'), 2) / (2 * Math.pow(variance.female.weight, 2)));
  
  let mp = mhp * mwp, fp = fhp * fwp;
  let txt = '';
  txt += `男性平均身高: ${getAvgHeight(a, 'male')}<br>`;
  txt += `男性平均體重: ${getAvgWeight(a, 'male')}<br>`;
  txt += `女性平均身高: ${getAvgHeight(a, 'female')}<br>`;
  txt += `女性平均體重: ${getAvgWeight(a, 'female')}<br>`;
  txt += '<br>';
  txt += `男性身高後驗機率: ${mhp}<br>`;
  txt += `男性體重後驗機率: ${mwp}<br>`;
  txt += `女性身高後驗機率: ${fhp}<br>`;
  txt += `女性體重後驗機率: ${fwp}<br>`;
  txt += '<br>';
  txt += `男性後驗機率: ${mp}<br>`;
  txt += `女性後驗機率: ${fp}<br>`;
  if(mp > fp){
    txt += "<br><span style='font-size:300%'>您屬於: 男性體位</span>";
  }
  else{
    txt += "<br><span style='font-size:300%'>您屬於: 女性體位</span>";
  }
  re.innerHTML = txt;
}

function logResult(){
  console.log("Factor:");
  console.log(`Male: ${maleFactor} Female: ${femaleFactor}`)
  for(let i=1;i<=100;++i){
    console.log("---------------------\n" + i + ':')
    console.log(`Male: ${getAvgHeight(i, 'male')} ${getAvgWeight(i, 'male')}`)
    console.log(`Female: ${getAvgHeight(i, 'female')} ${getAvgWeight(i, 'female')}`)
  }
}

function logTrainingDataResult(log = false){
  if(log){
    console.log("========================")
    console.log("Male test:");
  }
  let cnt = 0, correct = 0;
  for(let p in heightData.male){
    if(heightData.male.hasOwnProperty(p)){
      let a = parseInt(p);
      for(let i=0;i<heightData.male[p].length;++i){
        let w = weightData.male[p][i];
        let h = heightData.male[p][i];
        let re = determineResult(w, h, a);
        if(log){
          console.log(`A: ${a} H: ${h} W: ${w}`);
          console.log(`${re} ${re=='male' ? 'O' : 'X'}`);
        }
        cnt += 1;
        if(re == 'male'){correct += 1;}
      }
    }
  }
  if(log){
    console.log("========================")
    console.log("Female test:");
  }
  for(let p in heightData.female){
    if(heightData.female.hasOwnProperty(p)){
      let a = parseInt(p);
      for(let i=0;i<heightData.female[p].length;++i){
        let w = weightData.female[p][i];
        let h = heightData.female[p][i];
        let re = determineResult(w, h, a);
        if(log){
          console.log(`A: ${a} H: ${h} W: ${w}`);
          console.log(`${re} ${re=='female' ? 'O' : 'X'}`);
        }
        cnt += 1;
        if(re == 'female'){correct += 1;}
      }
    }
  }

  return correct / cnt;
}