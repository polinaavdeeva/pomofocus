const Modal = {
    toggleTaskModal() {
        taskModal.classList.toggle('hidden')
        addTaskButton.classList.toggle('hidden')

        taskMenuModal.classList.add('hidden')
        noteInput.classList.add('hidden')
        addNoteButton.classList.remove('hidden')

        task.clearFields()
    },

    toggleTaskMenuModal() {
        taskMenuModal.classList.toggle('hidden')

        taskModal.classList.add('hidden')

        task.clearFields()
    },

    toggleNoteInput() {
        noteInput.classList.toggle('hidden')
        addNoteButton.classList.toggle('hidden')
    }
}

const lStorage = {
    get() {
        return JSON.parse(localStorage.getItem('pomofocus:tasks')) || []
    },

    set(tasks) {
        localStorage.setItem('pomofocus:tasks', JSON.stringify(tasks))
    }
}

const task = {

    tasks: lStorage.get(),

    taskDescriptionInput: document.querySelector('#workingOnInput'),

    actInput: document.querySelector('#actInput'),

    pomodoroQuantityInput: document.querySelector('#quantityPomodoros'),

    noteInput: document.querySelector('#noteInput'),

    getValues() {
        return {
            taskDescription: this.taskDescriptionInput.value.trim(),
            act: this.actInput.value,
            pomodoroQuantity: this.pomodoroQuantityInput.value,
            note: this.noteInput.value,
            finished: false
        }
    },

    clearFields() {
        this.taskDescriptionInput.value = ''
        this.actInput.value = '0'
        this.pomodoroQuantityInput.value = '1'
        this.noteInput.value = ''
    },

    submit(event) {
        event.preventDefault()
        DOM.clearTaskDisplay()

        this.tasks.push(this.getValues())
        this.reloadTasks()

        Modal.toggleTaskModal()
        this.clearFields()
    },

    toggleFinished(index) {
        let taskElements = document.querySelectorAll(`#tasksContainer div.task`)

        let finishedTaskElement = taskElements[index]
        let markFinishedTaskButton = finishedTaskElement.querySelector(
            '.markFinishedTaskButton'
        )

        finishedTaskElement.classList.toggle('finished')
        markFinishedTaskButton.classList.toggle('finished')

        if (finishedTaskElement.classList.contains('finished')) {
            task.tasks[index].finished = true
        } else {
            task.tasks[index].finished = false
        }
    },

    increasePomodoroQuantityValue() {
        let newValue = Number(this.pomodoroQuantityInput.value)
        newValue += 1
        this.pomodoroQuantityInput.value = newValue.toString()
    },

    decreasePomodoroQuantityValue() {
        let newValue = Number(this.pomodoroQuantityInput.value)
        if (newValue === 1) return
        newValue -= 1
        this.pomodoroQuantityInput.value = newValue.toString()
    },

    reloadTasks() {
        DOM.clearTaskDisplay()
        task.tasks.forEach((task, index) => {
            DOM.insertTask(DOM.createTask(task, index))
        })
        lStorage.set(task.tasks)
    }
}

const timer = {
    getTime() {
        let formattedTime

        if (App.time === 0) {
            App.alarmClockAudio.play()
            timer.changeTimer()
            return
        }

        App.time -= 1000

        // таймер

        let seconds = (App.time % (60 * 1000)) / 1000
        let minutes = Math.floor(App.time / (60 * 1000))

        let displayMinutes = minutes < 10 ? '0' + minutes : minutes
        let displaySeconds = seconds < 10 ? '0' + seconds : seconds

        formattedTime = `${displayMinutes}:${displaySeconds}`

        App.updateTimer(formattedTime)
    },

    startTimer() {
        App.buttonAudio.play()

        this.timerInterval = setInterval(this.getTime, 1000)
        timerButton.textContent = 'STOP'

        timerButton.onclick = () => this.stopTimer()

        DOM.skipTimerButton.style.opacity = '1'
        timerButton.style.transform = 'translateY(6px)'
        timerButton.style.boxShadow = 'none'
    },

    stopTimer() {
        App.buttonAudio.play()

        clearInterval(this.timerInterval)
        timerButton.textContent = 'START'

        timerButton.onclick = () => this.startTimer()

        DOM.skipTimerButton.style.opacity = '0'
        timerButton.style.transform = 'translateY(-6px)'
        timerButton.style.boxShadow = 'rgb(235 235 235) 0px 6px 0px'
    },

    changeTimer() {
        // изменение таймера

        App.checkTab()
        switch (true) {
            case App.pomodoroTabCheck && App.counterLongCheck:
                App.counter += 1
                App.longBreak()
                break

            case App.pomodoroTabCheck:
                App.counter += 1
                App.shortBreak()
                break

            case App.shortBreakTabCheck || App.longBreakTabCheck:
                App.Pomodoro()
                break
        }
    },

    resetTimer() {
        App.checkTab()
        switch (true) {
            case App.pomodoroTabCheck:
                App.Pomodoro()
                break

            case App.shortBreakTabCheck:
                App.shortBreak()
                break

            case App.longBreakTabCheck:
                App.longBreak()
                break
        }
    },

    skipTimer() {
        this.stopTimer()

        if (
            confirm(
                "Уверены, что хотите закончить раньше?"
            )
        ) {
            this.changeTimer()
            return
        }

        this.startTimer()
    }
}

const style = {
    changingElements: [
        document.body,
        document.querySelector('#rightUl li:nth-child(1) a'),
        document.querySelector('#rightUl li:nth-child(2) a'),
        document.querySelector('#rightUl li:nth-child(3) a'),
        document.querySelector('.timer__options ul li:nth-child(1)'),
        document.querySelector('.timer__options ul li:nth-child(2)'),
        document.querySelector('.timer__options ul li:nth-child(3)'),
        document.querySelector('body .line'),
        document.querySelector('#tasksContainer .line'),
        document.querySelector('.timer-container'),
        document.querySelector('#timerButton'),
        document.querySelector('#menuButton'),
        document.querySelector('#addTaskButton'),
        document.querySelector('#timeToSomething')
    ],

    setPomodoroStyle() {
        this.changingElements.forEach(element => {
            element.classList.remove(`${App.currentTab}`)
            element.classList.add('Pomodoro')
        })

        timeToSomething.textContent = 'Time to focus!'
    },

    setShortBreakStyle() {
        this.changingElements.forEach(element => {
            element.classList.remove(`${App.currentTab}`)
            element.classList.add('shortBreak')
        })

        timeToSomething.textContent = 'Time for a break!'
    },

    setLongBreakStyle() {
        this.changingElements.forEach(element => {
            element.classList.remove(`${App.currentTab}`)
            element.classList.add('longBreak')
        })
    }
}

const DOM = {
    timerDiv: document.querySelector('#timer'),
    skipTimerButton: document.querySelector('.skipTimerButton'),

    createTask(object, index) {
        let innerHtml
        let finished = object.finished

        switch (true) {
            case object.note === '' && finished === true:
                innerHtml = `
                    <div class="taskTextContainer">
                        <div onclick="task.toggleFinished(${index})" class="markFinishedTaskButton finished"></div>
                        <span class="taskDescription">${object.taskDescription}</span>
                        
                        <div>
                            <span>${object.act}</span>
                            <span>/</span>
                            <span>${object.pomodoroQuantity}</span>
                        </div>
                    </div>`
                break

            case object.note != '' && finished === true:
                innerHtml = `
                    <div class="taskTextContainer">
                        <div onclick="task.toggleFinished(${index})" class="markFinishedTaskButton finished"></div>
                        <span class="taskDescription">${object.taskDescription}</span>
                        
                        <div>
                            <span>${object.act}</span>
                            <span>/</span>
                            <span>${object.pomodoroQuantity}</span>
                        </div>
                    </div>
                    <div id="taskNote">
                    ${object.note}
                    </div>`
                break

            case object.note != '':
                innerHtml = `
                    <div class="taskTextContainer">
                        <div onclick="task.toggleFinished(${index})" class="markFinishedTaskButton"></div>
                        <span class="taskDescription">${object.taskDescription}</span>
                        
                        <div>
                            <span>${object.act}</span>
                            <span>/</span>
                            <span>${object.pomodoroQuantity}</span>
                        </div>
                    </div>
                    <div id="taskNote">
                    ${object.note}
                    </div>`
                break

            default:
                innerHtml = `
                    <div class="taskTextContainer">
                        <div onclick="task.toggleFinished(${index})" class="markFinishedTaskButton"></div>
                        <span class="taskDescription">${object.taskDescription}</span>
                        
                        <div>
                            <span>${object.act}</span>
                            <span>/</span>
                            <span>${object.pomodoroQuantity}</span>
                        </div>
                    </div>`
                break
        }

        return { innerHtml, finished }
    },

    insertTask(htmlData) {
        let div = document.createElement('div')
        let addTaskButton = document.querySelector('#addTaskButton')

        div.classList.add('task')
        div.innerHTML = htmlData.innerHtml
        if (htmlData.finished) {
            div.classList.add('finished')
        }

        tasksContainer.insertBefore(div, addTaskButton)
    },

    clearTaskDisplay() {
        let tasks = document.querySelectorAll('.task')
        tasks.forEach(task => {
            task.remove()
        })
    },

    clearAllTasks() {
        task.tasks = []
        task.reloadTasks()
    },

    clearFinishedTasks() {
        for (let i = task.tasks.length - 1; i >= 0; i--) {
            if (task.tasks[i].finished === true) {
                task.tasks.splice(i, 1)
            }
        }

        task.reloadTasks()
    }
}

const App = {
    init() {
        this.time = 1000 * 60 * 25
        this.counter = 1

        this.currentTab = 'Pomodoro'
        style.setPomodoroStyle()

        this.addEventListeners()
        this.setAudios()

        task.reloadTasks()
    },

    Pomodoro() {
        style.setPomodoroStyle()

        this.currentTab = 'Pomodoro'
        this.time = 1000 * 60 * 25
        this.updateTimer('25:00')

        timer.stopTimer()
    },

    shortBreak() {
        style.setShortBreakStyle()

        this.currentTab = 'shortBreak'
        this.time = 1000 * 60 * 5
        this.updateTimer('05:00')

        timer.stopTimer()
    },

    longBreak() {
        style.setLongBreakStyle()

        this.currentTab = 'longBreak'
        this.time = 1000 * 60 * 15
        this.updateTimer('15:00')

        timer.stopTimer()
    },

    updateTimer(currentTime) {
        DOM.timerDiv.textContent = currentTime
        counter.textContent = `#${this.counter}`
    },

    checkTab() {

        this.pomodoroTabCheck = this.currentTab === 'Pomodoro' ? true : false

        this.shortBreakTabCheck =
            this.currentTab === 'shortBreak' ? true : false

        this.longBreakTabCheck = this.currentTab === 'longBreak' ? true : false

        this.counterLongCheck = (this.counter + 1) % 4 === 0 ? true : false
    },

    addEventListeners() {
        timerButton.onclick = () => timer.startTimer()
        DOM.skipTimerButton.onclick = () => timer.skipTimer()

        pomodoroTab.onclick = () => this.Pomodoro()
        shortBreakTab.onclick = () => this.shortBreak()
        longBreakTab.onclick = () => this.longBreak()

        menuButton.onclick = () => Modal.toggleTaskMenuModal()
        addTaskButton.onclick = () => Modal.toggleTaskModal()
        cancelButton.onclick = () => Modal.toggleTaskModal()

        increaseQuantity.onclick = () => task.increasePomodoroQuantityValue()

        decreaseQuantity.onclick = () => task.decreasePomodoroQuantityValue()

        addNoteButton.onclick = () => Modal.toggleNoteInput()

        clearAllTasks.onclick = () => DOM.clearAllTasks()
        clearFinishedTasks.onclick = () => DOM.clearFinishedTasks()
        resetCounter.onclick = () => {
            this.counter = 1
            counter.textContent = `#${this.counter}`
        }

        resetTimer.onclick = () => {
            timer.resetTimer()
        }
    },

    setAudios() {
        this.alarmClockAudio = new Audio('./audio/alarm_clock.mp3')
        this.buttonAudio = new Audio('./audio/clickMinecraft.mp3')
    }
}

App.init()