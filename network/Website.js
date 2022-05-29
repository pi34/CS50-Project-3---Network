import wixData from 'wix-data';
import { product } from 'wix-stores';
import { cart } from 'wix-stores';

// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world

export function checkAvailability(prodId, choices) {
	return product.getOptionsAvailability(prodId, choices)
		.then((availability) => {
			const available = availability.availableForPurchase
			const data = availability.selectedVariant
						  if (available) {
								  return availability
							  } else {
								  return false
							  }
					  })
					  .catch((error) => {
    					return false
  					  });
}


$w.onReady(function () {
	
		
			wixData.query('Stores/Collections')
			.eq("name",$w("#title").text)
            .find()
			.then( results => {
				console.log(results)
				var item = results.items[0]
				wixData.query(`Stores/Products`)
				.include("collections")
		  .hasSome("collections", item._id)
		  .find()
  			.then( (results) => { 
				  $w("#text35").html = results.items[0]["description"]
				  $w("#html1").onMessage( (event) => {
				  if (event.data.message1) {
					  var choices = {}
					choices ["Right/Left"] = event.data.message1["Right/Left"]
					choices ["SPH"] = event.data.message1["SPH"]
					choices ["CYL"] = event.data.message1["CYL"]
					choices ["Addition"] = event.data.message1["Addition"]
					results.items.every(element => {
					  console.log(element._id)
					  product.getOptionsAvailability(element._id, choices)
						.then((availability) => {
							const available = availability.availableForPurchase
							const data = availability.selectedVariant
						  	if (available) {
								$w("#html1").postMessage(data)
								return false
							} else {
								$w("#html1").postMessage(false)
								return true
							  }
					  })
					  .catch((error) => {
						  $w("#html1").postMessage(false)
    					return true
  					  });
					return true
				  })
				  }  else if (event.data.message2) {
					  console.log(event.data.message2)
						event.data.message2.forEach(item => {
							var products = [];
							console.log(item)
							var prod = new Object()
							var choices = {}
							choices ["Right/Left"] = item["Right/Left"]
							choices ["SPH"] = item["SPH"]
							choices ["CYL"] = item["CYL"]
							choices ["Addition"] = item["Addition"]
							console.log(results)
							results.items.every(element => {
								console.log(element)
								product.getOptionsAvailability(element._id, choices)
									.then((availability) => {
										const available = availability.availableForPurchase
										if (available) {
											var options = {}
											options["choices"] = choices
											var custom = []
											var axis = {
												"title" : "Axis",
												"value" : item["Axis"]
											}
											custom.push(axis)
											options["customTextFields"] = custom
											prod["productId"] = element._id
											prod["quantity"] = item["Quantity"]
											prod["options"] = options

											console.log(prod)

											products.push(prod)

											cart.addProducts(products)
												.then((updatedCart) => {
												// Products added to cart
													const cartId = updatedCart._id;
													const cartLineItems = updatedCart.lineItems;
													console.log(cartId)
													console.log(cartLineItems)
												})
												.catch((error) => {
													// Products not added to cart
													console.error(error);
												});
											console.log(products)

											return false

										} else {
											return true
										}
								})
								.catch((error) => {
									return true
								});
								return true
							})
							
						});
					}
				  });  
			} )
		})
		
});