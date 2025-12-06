function copyCode(copybtn, str_copied) {
    const codeElement = copybtn.parentElement.nextElementSibling.firstElementChild.firstElementChild;
	const str_copy = copybtn.textContent
	//document.querySelector('code');
    const textArea = document.createElement('textarea');
    textArea.value = codeElement.textContent;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    //alert('Code copied to clipboard!');
	copybtn.disabled = true;
	copybtn.textContent = str_copied;

	setTimeout(function() {
		// After 30 seconds, change the button content and re-enable it
		copybtn.innerText = str_copy;
		copybtn.disabled = false;
	}, 2000); // 2,000 milliseconds = 2 seconds
}
