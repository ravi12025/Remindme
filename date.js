exports.getDate=function(){

    const date = new Date();
    var options  = {
        day : "numeric",
        weekday : "long",
        month : "long",
    };
     return date.toLocaleDateString("en-US",options);
}