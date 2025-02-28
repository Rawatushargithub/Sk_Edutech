//Here we are standardizing the API error and API Response

// Node has its error classes

class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        errors = [], // this is for passing multiple errors
        stack = "" //this is error stack
        ){
        super(message)
        this.statusCode = statusCode
        this.data = null //find what is inside the this.data field
        this.message = message
        //success code will not go becoz we are handling apierror not response
        this.success = false;// success message will go but if the flag is using in frontend then it will become false
        this.errors = errors
        
        if (stack) {
            this.stack = stack
        }
        else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}
export { ApiError }