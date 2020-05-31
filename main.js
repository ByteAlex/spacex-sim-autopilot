let manual = true

function autopilot() {
    manual = !manual
    if (manual) {
        console.log("AutoPilot DISABLED")
    } else {
        console.log("AutoPilot ENABLED")
    }
}

function loop() {
    if (manual) {
        setTimeout(loop, 1000)
        return
    }
    if (isInErrorThreshold()) {
        correctDistance()
    }
    correctError()
    setTimeout(loop, 100)
}

function correctDistance() {
    if (getDistanceZ() < 50 && getDistanceY() < 50) {
        speedThreshold(100, 500, 1.9, 2.5, 2.0, false)
        speedThreshold(50, 100, 0.9, 1.1, 1.0, false)
        speedThreshold(25, 50, 0.4, 0.75, 0.5, false)
        speedThreshold(5, 25, 0.2, 0.5, 0.35, false)
        speedThreshold(3, 5, 0.005, 0.05, 0.03, false)
        speedThreshold(0, 3, 0.001, 0.01, 0.008, true)
    }
    console.log(motionVector)
    zThreshold(50, 1000, translationPulseSize * 50)
    zThreshold(10, 50, translationPulseSize * 25)
    zThreshold(0, 10, translationPulseSize * 2)

    yThreshold(50, 1000, translationPulseSize * 50)
    yThreshold(10, 50, translationPulseSize * 25)
    yThreshold(0, 10, translationPulseSize * 2)
}

let ratelimitArray = {}

function ratelimit(key, interval, fun) {
    let lastEntry = ratelimitArray[key];
    if (!lastEntry) lastEntry = 0
    let now = new Date().getTime()
    if (now - lastEntry > interval) {
        ratelimitArray[key] = now
        fun()
    }
}

function zThreshold(distanceMin, distanceMax, threshold) {
    if (getDistanceZ() === 0) {
        if (motionVector.y < -translationPulseSize * 2) {
            translateUp()
        } else if (motionVector.y > translationPulseSize * 2) {
            translateDown()
        }
        return
    }
    if (getDistanceZ() >= distanceMin && getDistanceZ() < distanceMax) {
        if (motionVector.y > -threshold) {
            translateDown()
        }
    }
    if (getDistanceZ() <= -distanceMin && getDistanceZ() > -distanceMax) {
        if (motionVector.y < threshold) {
            translateUp()
        }
    }
}

function yThreshold(distanceMin, distanceMax, threshold) {
    if (getDistanceY() === 0) {
        if (motionVector.x < -translationPulseSize * 2) {
            translateRight()
        } else if (motionVector.x > translationPulseSize * 2) {
            translateLeft()
        }
        return
    }
    if (getDistanceY() >= distanceMin && getDistanceY() < distanceMax) {
        if (motionVector.x > -threshold) {
            translateLeft()
        }
    }
    if (getDistanceY() <= -distanceMin && getDistanceY() > -distanceMax) {
        if (motionVector.x < threshold) {
            translateRight()
        }
    }
}

function speedThreshold(distanceMin, distanceMax, speedMin, speedMax, speed, ratelimited) {
    if (getDistanceX() >= distanceMin && getDistanceX() < distanceMax) {
        if (getSpeed() < speedMin || getSpeed() > speedMax) {
            if (getSpeed() < speed) {
                if (ratelimited) {
                    ratelimit("speed-up", 1000, translateForward)
                } else {
                    translateForward()
                }
            } else {
                if (ratelimited) {
                    ratelimit("speed-down", 1000, translateDown)
                } else {
                    translateBackward()
                }
            }
        }
    }
}

function correctError() {
    rollThreshold(10, 500, 25)
    rollThreshold(5, 10, 10)
    rollThreshold(1, 5, 5)
    rollThreshold(0.2, 1, 2)
    rollThreshold(0.1, 0.2, 1)

    rollThreshold(-0.01, 0.01, 0)

    //

    pitchThreshold(10, 500, 25)
    pitchThreshold(5, 10, 10)
    pitchThreshold(1, 5, 5)
    pitchThreshold(0.2, 1, 2)
    pitchThreshold(0.1, 0.2, 1)

    pitchThreshold(-0.01, 0.01, 0)

    //

    yawThreshold(10, 500, 25)
    yawThreshold(5, 10, 10)
    yawThreshold(1, 5, 5)
    yawThreshold(0.2, 1, 2)
    yawThreshold(0.1, 0.2, 1)

    yawThreshold(-0.01, 0.01, 0)
}

function rollThreshold(errorMin, errorMax, threshold) {
    let rollRate = getRollRate()
    if (getRollError() >= errorMin && getRollError() < errorMax) {
        if (rollRate !== threshold) {
            if (rollRate < threshold) {
                rollRight()
                rollRate++
            } else {
                rollLeft()
                rollRate--
            }
        }
    }
    if (getRollError() <= -errorMin && getRollError() > -errorMax) {
        if (rollRate !== -threshold) {
            if (rollRate < -threshold) {
                rollRight()
                rollRate++
            } else {
                rollLeft()
                rollRate--
            }
        }
    }
}

function pitchThreshold(errorMin, errorMax, threshold) {
    let pitchRate = getPitchRate()
    if (getPitchError() >= errorMin && getPitchError() < errorMax) {
        if (pitchRate !== threshold) {
            if (pitchRate < threshold) {
                pitchDown()
                pitchRate++
            } else {
                pitchUp()
                pitchRate--
            }
        }
    }
    if (getPitchError() <= -errorMin && getPitchError() > -errorMax) {
        if (pitchRate !== -threshold) {
            if (pitchRate < -threshold) {
                pitchDown()
                pitchRate++
            } else {
                pitchUp()
                pitchRate--
            }
        }
    }
}

function yawThreshold(errorMin, errorMax, threshold) {
    let yawRate = getYawRate()
    if (getYawError() >= errorMin && getYawError() < errorMax) {
        if (yawRate !== threshold) {
            if (yawRate < threshold) {
                yawRight()
                yawRate++
            } else {
                yawLeft()
                yawRate--
            }
        }
    }
    if (getYawError() <= -errorMin && getYawError() > -errorMax) {
        if (yawRate !== -threshold) {
            if (yawRate < -threshold) {
                yawRight()
                yawRate++
            } else {
                yawLeft()
                yawRate--
            }
        }
    }
}

function isInErrorThreshold() {
    return getRollError() < 0.1 && getPitchError() < 0.1 && getYawError() < 0.1
        && getRollError() > -0.1 && getPitchError() > -0.1 && getYawError() > -0.1
}

function getDistanceX() {
    return getRawDistance("x")
}

function getDistanceY() {
    return getRawDistance("y")
}

function getDistanceZ() {
    return getRawDistance("z")
}

function getSpeed() {
    let rate = $("#rate > .rate").textContent;
    return Number(rate.substr(0, rate.length - 4)) * -1
}

function getRollError() {
    return getRawError("roll")
}

function getPitchError() {
    return getRawError("pitch")
}

function getYawError() {
    return getRawError("yaw")
}

function getRawError(type) {
    let raw = $("#" + type + " > .error").textContent;
    return Number(raw.substr(0, raw.length - 1))
}

function getRollRate() {
    return getRawRate("roll")
}

function getPitchRate() {
    return getRawRate("pitch")
}

function getYawRate() {
    return getRawRate("yaw")
}

function getRawRate(type) {
    let raw = $("#" + type + " > .rate").textContent;
    return Number(raw.substr(0, raw.length - 4)) * 10
}

function getRawDistance(type) {
    let raw = $("#" + type + "-range > .distance").textContent;
    return Number(raw.substr(0, raw.length - 2))
}

loop()