const isValidName = function (value) {
    if (typeof value === "undefined" || value === null || value == " ")
        return false;
    if (typeof value === "string" && value.trim().length > 0 && value.match(/^[a-zA-Z]*$/))
        return true;
    return false;
}

const isValidRequestBody = function (value) {
    return Object.keys(value).length > 0;
}

const isValidEmail = function (value) {
    return (/^[a-z]{1}[a-z-A-Z-0-9]{1,}@[a-z-A-Z]{3,}[.]{1}[a-z]{3,6}$/).test(value)

}

const isValidPass = function (value) {
    if (value.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/))
        return true
    return false

}


const isValidMarks = function (value) {
    return (/^[0-9]$/).test(value)

}



module.exports = { isValidRequestBody, isValidEmail, isValidPass, isValidName, isValidMarks }