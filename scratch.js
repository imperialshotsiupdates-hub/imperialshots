function showScratch(){

document.getElementById("scratchBox").style.display="block"

}

function scratchReward(){

let rewards=[
"10% OFF Coupon",
"15% OFF Coupon",
"Free Reel Video",
"₹500 Discount",
"₹1000 Wedding Discount"
]

let reward=rewards[Math.floor(Math.random()*rewards.length)]

document.getElementById("rewardText").innerText=reward

}