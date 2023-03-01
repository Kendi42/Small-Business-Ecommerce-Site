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

// Chart for user growth

