//Deleting a Record
function deleteRecord(resultTable, recordID){
	console.log("Record ID from delte", resultTable);
	console.log("PatientID from delte", recordID);

	fetch(`/results/${resultTable}/${recordID}`, {
		method: 'DELETE'
	  })
	  .then((response) => {
		console.log("Inside then response");
		// Remove the table row from the DOM
		const row = document.getElementById(`record-${resultTable}-${recordID}`);
		if (row) {
			row.remove();
			console.log("Row removed");
		}
	})
	  .catch(error => {
		console.error('Error deleting record:', error);
	  });

}

function newStore(){
  const newShopModal = document.getElementById('newShopModal');
  new bootstrap.Modal(newShopModal).toggle();
  return;
}


function newProduct(){
  const newProductModal = document.getElementById('newProductModal');
  new bootstrap.Modal(newProductModal).toggle();
  return;
}




// CREATING A NEW STORE STEP BY STEP FORM

const navigateToFormStep = (stepNumber) => {
    
    document.querySelectorAll(".form-step").forEach((formStepElement) => {
        formStepElement.classList.add("d-none");
    });

    document.querySelectorAll(".form-stepper-list").forEach((formStepHeader) => {
        formStepHeader.classList.add("form-stepper-unfinished");
        formStepHeader.classList.remove("form-stepper-active", "form-stepper-completed");
    });
  
    document.querySelector("#step-" + stepNumber).classList.remove("d-none");
   
    const formStepCircle = document.querySelector('li[step="' + stepNumber + '"]');
  
    formStepCircle.classList.remove("form-stepper-unfinished", "form-stepper-completed");
    formStepCircle.classList.add("form-stepper-active");
    for (let index = 0; index < stepNumber; index++) {
   
        const formStepCircle = document.querySelector('li[step="' + index + '"]');
       
        if (formStepCircle) {
         
            formStepCircle.classList.remove("form-stepper-unfinished", "form-stepper-active");
            formStepCircle.classList.add("form-stepper-completed");
        }
    }
};

document.querySelectorAll(".btn-navigate-form-step").forEach((formNavigationBtn) => {
   
    formNavigationBtn.addEventListener("click", () => {
     
        const stepNumber = parseInt(formNavigationBtn.getAttribute("step_number"));
        navigateToFormStep(stepNumber);
    });
});

// SUBMIT DATA: FORMAT CHECKBOX INPUT
const form = document.getElementById('createstoreform');

form.addEventListener('submit', function(event) {
  event.preventDefault();

  // Get the selected delivery days
  const deliveryDays = Array.from(form.querySelectorAll('input[name="deliveryDay"]:checked')).map(input => input.value);

  // Create a new object with the key "delivery days" and the array of selected days as the value
  const deliveryDaysObj = {
    "delivery days": deliveryDays
  };

  // Convert the object to JSON
  const deliveryDaysJSON = JSON.stringify(deliveryDaysObj);

  console.log(deliveryDaysJSON);


  // Get the selected store categories
  const storeCategories = Array.from(form.querySelectorAll('input[name="storeCategory"]:checked')).map(input => input.value);

  // Create a new object with the key "delivery days" and the array of selected days as the value
  const storeCategoriesObj = {
    "store categories": storeCategories
  };

  // Convert the object to JSON
  const storeCategoriesJSON = JSON.stringify(storeCategoriesObj);

  console.log(storeCategoriesJSON);

  // Submit the form data to the server
  form.submit();
});