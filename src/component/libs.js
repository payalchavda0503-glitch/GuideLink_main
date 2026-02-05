export const toDMY = (date) => {

    if(!date){
        return ""
    }
    
    console.log("date before", date)

    return new Intl.DateTimeFormat('en-GB').format(date).replace(/\//g, '-');
}

export const to24HourTime = (date) => {
    
    if(!date){
        return ""
    }

    return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false // Ensures 24-hour time format
      }).format(date);
}