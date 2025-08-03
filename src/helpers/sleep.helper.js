const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

async function exeFuncInDuration (func,duration,intervalTime=3){
  const startTime = new Date().getTime();
  while (1){
    if(duration && (new Date().getTime() - startTime)/1000 > duration){
      return;
    }
    await func()
    await sleep(intervalTime*1000)
  }
}


module.exports={
  sleep,
  exeFuncInDuration
}
