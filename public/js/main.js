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
function openCart(storeID) {
  console.log("StoreID for cart", storeID)

  fetch(`/viewcart/${storeID}`)
  .then(response => response.text())
  .then(data => {
    // Set the HTML content of the offcanvas element to the response
    
    const offcanvasElement = document.getElementById('cartOffcanvas');
    const offcanvasElement2 = document.getElementById('offcanvas-body');

    // Parse the JSON string into a JavaScript object
    const cartData = JSON.parse(data);

    // Render the cart items using the parsed data
    const cartItemsHTML = cartData.items.map(item => `
    <li class="list-group-item d-flex flex-column  justify-content-between align-items-start align-items-sm-center" id="cartItem-${item.cartID}">
    <div class="d-flex justify-content-between align-items-start align-items-sm-center w-100 mb-2 mb-sm-0">
      <div>
        <h6 class="my-0">${item.productName}</h6>
      </div>
      <div>
        <button class="btn btn-outline-danger btn-sm ml-3" id="removeItemBtn-${item.cartID}" onclick="deleteCartItem(${item.cartID}, ${item.quantity}, ${storeID}  )"><i class="fas fa-trash"></i></button>
      </div>
    </div>
    <div class="d-flex justify-content-between align-items-center w-100">
      <div class="mr-3">
        <div class="input-group input-group-sm">
          <button class="btn btn-outline-secondary" type="button" id="quantityMinusBtn">-</button>
          <input type="text" class="form-control" aria-label="Product quantity" value="${item.quantity}" id="quantityInput-${item.cartID}" readonly>
          <button class="btn btn-outline-secondary" type="button" id="quantityPlusBtn">+</button>
        </div>
      </div>
      <strong class="item-total">${item.total}</strong>
    </div>
  </li>
    `).join('');

    // Update the offcanvas body with the rendered cart items
    offcanvasElement2.innerHTML = `
      <ul class="list-group mb-3">
        ${cartItemsHTML}
        <li class="list-group-item d-flex justify-content-between">
          <span>Total (KSH)</span>
          <strong id="cartTotal" >${cartData.total}</strong>
        </li>
      </ul>
      <a href="/checkout" type="button" class="w-100 btn btn-primary btn-lg" type="submit">Checkout</a>
    `;

    // Initialize the offcanvas
    const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show();

    const minusBtns = document.querySelectorAll('#quantityMinusBtn');
    const plusBtns = document.querySelectorAll('#quantityPlusBtn');

    minusBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const inputField = btn.parentElement.querySelector('input');
        const newQuantity = parseInt(inputField.value) - 1;

        if (newQuantity >= 0) {
          inputField.value = newQuantity;
          updateCart(inputField.id.split('-')[1], newQuantity, storeID);
        }
      });
    });

    plusBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const inputField = btn.parentElement.querySelector('input');
        const newQuantity = parseInt(inputField.value) + 1;

        inputField.value = newQuantity;
        updateCart(inputField.id.split('-')[1], newQuantity, storeID);
      });
    });

  })
  .catch(error => console.error(error));

}

function deleteCartItem(itemID, quantity, storeID){
  console.log("Inside Delete cart item")
  console.log("cart id", itemID)

  fetch(`/removeitem/${itemID}`, {
		method: 'DELETE'
	  })
	  .then((response) => {
		console.log("Inside then response");
		// Remove the table row from the DOM
		const row = document.getElementById(`cartItem-${itemID}`);
		if (row) {
			row.remove();
			console.log("Row removed");
      updateCart(itemID, quantity, storeID)
      // Decrement cart number
      const cartCountHTML = document.getElementById('cartCount');
      const cartCount = parseInt(cartCountHTML.textContent);
      cartCountHTML.textContent = `${cartCount - 1}`;

		}
	})
	  .catch(error => {
		console.error('Error deleting record:', error);
	  });


}

function updateCart(itemID, newQuantity, storeID) {
  fetch(`/updatecart/${itemID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      quantity: newQuantity
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Cart updated:', data);

    // Send a request to get the updated cart data
    fetch(`/viewcart/${storeID}`)
      .then(response => response.text())
      .then(data => {
        // Parse the JSON string into a JavaScript object
        const cartData = JSON.parse(data);
        console.log("Cart Data", cartData)

        // Update the cart and item totals based on the updated data
        const cartTotalElement = document.querySelector('#cartTotal');
        cartTotalElement.textContent = `${cartData.total}`;

        const itemTotalElements = document.querySelectorAll('.item-total');
        itemTotalElements.forEach((element, index) => {
          element.textContent = `${cartData.items[index].total}`;
        });
      })
      .catch(error => console.error(error));
  })
  .catch(error => console.error(error));
}


// Closing Modal
function closeModal(pid) {
  const modalId = "#moreinfomodal-" + pid;
  const modal = document.querySelector(modalId);
  const modalInstance = bootstrap.Modal.getInstance(modal);
  modalInstance.hide();
  }


// Adding Products to Cart
function addtocart(pid, sid) {
  // Make a POST request to the server to add the product to the cart
  console.log("Inside main js add to cart")
  console.log("pid and sid", pid, sid)

  fetch('/addToCart', {
    method: 'POST',
    body: JSON.stringify({ pid: pid, sid:sid }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      // Handle the response from the server
      if (response.ok) {
        console.log('Product added to cart successfully');
        // Increment cart number
        const cartCountHTML = document.getElementById('cartCount');
        const cartCount = parseInt(cartCountHTML.textContent);
        cartCountHTML.textContent = `${cartCount + 1}`;
              // Close the modal
        closeModal(pid);
        // Open the cart drawer
        openCart(sid);
      } else {
        console.error('Error adding product to cart:', response.statusText);
      }
    })
    .catch(error => {
      console.error('Error adding product to cart:', error);
    });
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