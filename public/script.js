const submitInput = document.querySelector('.url-input');
const submitBtn = document.querySelector('.submit-btn');
const urlForm = document.querySelector('#url-form');

let isUrl = () =>{
    try{
        return Boolean(new URL(submitInput.value));
    }catch(e){
        return false;
    }
}

submitBtn.addEventListener('click', function(event){
    event.preventDefault();
    if(submitInput.value=='' || !isUrl()) return
    else{
        (() => {
            // add the animation classes
            submitBtn.classList.add('shrink-animation-btn');
            submitInput.classList.add('shrink-animation-input');

            // wait for the animation to finish and then submit the from
            setInterval(() => {
                urlForm.submit();
            }, 700);
        })();
    }
})