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


// Generating  Reports

function userReport(){
  
  console.log("Inside User report func");
  console.log("Data", data);


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


// Openign Cart Navigation Drawer
function openCart() {
  var offcanvasElement = document.getElementById('cartOffcanvas');
  var offcanvas = new bootstrap.Offcanvas(offcanvasElement);
  offcanvas.show();
}


// Closing Modal
function closeModal(pid) {
  const modalId = "#moreinfomodal-" + pid;
  const modal = document.querySelector(modalId);
  const modalInstance = bootstrap.Modal.getInstance(modal);
  modalInstance.hide();
  }


// Adding Products to Cart
function addtocart(pid) {
  // Make a POST request to the server to add the product to the cart
  console.log("Inside main js add to cart")
  fetch('/addToCart', {
    method: 'POST',
    body: JSON.stringify({ pid: pid }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      // Handle the response from the server
      if (response.ok) {
        console.log('Product added to cart successfully');
      } else {
        console.error('Error adding product to cart:', response.statusText);
      }
    })
    .catch(error => {
      console.error('Error adding product to cart:', error);
    });

  // Close the modal
  closeModal(pid);

  // Open the cart drawer
  openCart();
}

function loginWarning(pid){
  console.log("In login warning")
  closeModal(pid);

  var myModal = document.getElementById("loginwarningModal");
  var modal = new bootstrap.Modal(myModal);
  modal.show();

}




// SUBMIT DATA: FORMAT CHECKBOX INPUT
const form = document.getElementById('createstoreform');

form.addEventListener('submit', function(event) {
  console.log("In main.js")
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

  // Submit the form data to the server
  form.submit();
});


// SUBMIT DATA: FORMAT CHECKBOX INPUT
const editform= document.getElementById('editstoreform');

editform.addEventListener('submit', function(event) {
  console.log("In main.js")
  event.preventDefault();
  // Get the selected delivery days
  const deliveryDays = Array.from(editform.querySelectorAll('input[name="deliveryDay"]:checked')).map(input => input.value);

  // Create a new object with the key "delivery days" and the array of selected days as the value
  const deliveryDaysObj = {
    "delivery days": deliveryDays
  };

  // Convert the object to JSON
  const deliveryDaysJSON = JSON.stringify(deliveryDaysObj);
  console.log(deliveryDaysJSON);

  // Submit the form data to the server
  editform.submit();
});