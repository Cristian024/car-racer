var socket = io()
const myUrl = new URL(window.location.href);
const code = myUrl.pathname.split('/').pop();
const userName = myUrl.searchParams.get('user_name');
document.querySelector(".join-code").innerHTML = code
var container = document.querySelector(".reace-container")

var problem = document.querySelector(".problem")
var input = document.querySelector("input")
var form = document.querySelector("form")

var self = document.getElementById("self")
var racers = {}

var currentProblem = ""
var answered = 0
var carId = Math.floor(Math.random() * 3) + 1

function getQuestion() {
    input.value = ""
    var operators = "+-*"
    var operator = operators[Math.floor(Math.random() * operators.length)]
    var leftNum = parseInt(Math.random() * ((operator == "*" || operator == "/") ? 10 : 9)) + 1
    var rightNum = parseInt(Math.random() * ((operator == "*" || operator == "/") ? 10 : 10))
    var prob = leftNum + operator + rightNum
    problem.innerText = prob
    currentProblem = prob
}
getQuestion()

function addRacer(racerId) {
    let track = document.createElement("div")
    track.classList.add("race-track")
    track.innerHTML = '<div class="car"><img src="/img/' + parseInt(Math.random() * 3 + 1) + '.png" alt=""></div>'
    racers[racerId] = track
    container.appendChild(track)
}

function removeRacer(racerId) {
    container.removeChild(racers[racerId])
    delete racers[racerId]
}

socket.on("connect", function () {
    socket.on("joined-racers", function (racers) {
        racers.map(function (racerId) {
            addRacer(racerId)
        })
    })
    socket.on("racer-left", function (racerId) {
        removeRacer(racerId)
    })
    socket.on("racer-answered", function (data) {
        console.log(data, racers);
        racers[data.racerId].querySelector(".car").style.marginLeft = (data.answered * 10) + "%"
        if (data.answered >= 10) {
            problem.innerText = `${data.userName} ha completado la carrera!!!`
            form.innerHTML = ''
            self.classList.add("finished")
        }
    })
    socket.emit("join", code)
})

form.addEventListener('submit', function (e) {
    e.preventDefault()
    if (input.value.trim() == eval(currentProblem)) {
        answered++
        socket.emit("current-user-answered", {
            answered,
            gameId: code,
            carId: carId,
            userName: userName
        })
        self.style.marginLeft = (answered * 10) + "%"
        if (answered >= 10) {
            problem.innerText = 'Has completado la carrera!!!'
            form.innerHTML = ''
            self.classList.add("finished")
        } else {
            getQuestion()
        }
    }
})