const form = document.querySelector('#enquiry-form');
const fields = document.querySelector('#enquiry-fields');
const preview = document.querySelector('#enquiry-preview');
const previewTitle = document.querySelector('#preview-title');
const previewDetails = document.querySelector('#preview-details');

const intent = form.elements.namedItem('intent');
const machine = form.elements.namedItem('machine');
const listing = form.elements.namedItem('listing');
const machineLocation = form.elements.namedItem('machineLocation');
const destination = form.elements.namedItem('destination');
const email = form.elements.namedItem('email');
const phone = form.elements.namedItem('phone');
const machineLabel = machine.closest('label');
const listingLabel = listing.closest('label');
const listingOptional = document.querySelector('#listing-optional');
const sourceInstructions = document.querySelector('#source-instructions');
const inspectionInstructions = document.querySelector('#inspection-instructions');
const textFields = fields.querySelectorAll('input:not([type="radio"])');

function clearPreview() {
  preview.hidden = true;
  previewDetails.replaceChildren();
}

function updateEnquiryMode() {
  const isInspection = intent.value === 'inspection';
  const firstField = isInspection ? listingLabel : machineLabel;
  const fieldGroup = firstField.parentElement;
  if (firstField !== fieldGroup.firstElementChild) {
    fieldGroup.prepend(firstField);
  }

  machine.required = !isInspection;
  machine.setCustomValidity('');
  listing.setCustomValidity('');
  listingOptional.hidden = isInspection;
  sourceInstructions.hidden = isInspection;
  inspectionInstructions.hidden = !isInspection;
  fieldGroup.setAttribute('aria-describedby', isInspection ? inspectionInstructions.id : sourceInstructions.id);
}

form.addEventListener('input', (event) => {
  if (event.target.name === 'intent') {
    updateEnquiryMode();
  } else {
    event.target.setCustomValidity('');
    email.setCustomValidity('');
    if (event.target === machine) listing.setCustomValidity('');
  }
  clearPreview();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearPreview();

  for (const field of textFields) {
    field.setCustomValidity(field.required && !field.value.trim() ? form.dataset.emptyMessage : '');
  }

  if (!email.value.trim() && !phone.value.trim()) {
    email.setCustomValidity(form.dataset.contactMessage);
  } else if (email.validity.typeMismatch && form.dataset.emailMessage) {
    email.setCustomValidity(form.dataset.emailMessage);
  }

  if (listing.value && (listing.validity.typeMismatch || !/^https?:\/\//i.test(listing.value))) {
    listing.setCustomValidity(form.dataset.listingMessage);
  } else if (intent.value === 'inspection' && !listing.value.trim() && !machine.value.trim()) {
    listing.setCustomValidity(form.dataset.inspectionMessage);
  }

  if (!form.reportValidity()) return;

  for (const field of fields.querySelectorAll('input')) {
    if (field.type === 'radio' && !field.checked) continue;
    const value = field.type === 'radio'
      ? field.labels[0].textContent.trim()
      : field.value.trim();
    if (!value) continue;

    const label = field.type === 'radio'
      ? field.closest('fieldset').querySelector('legend').textContent
      : field.labels[0].firstChild.textContent.trim();
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    description.textContent = value;
    previewDetails.append(term, description);
  }

  preview.hidden = false;
  previewTitle.focus();
});

document.querySelectorAll('[data-enquiry]').forEach((link) => {
  link.addEventListener('click', () => {
    if (intent.value !== link.dataset.enquiry) {
      intent.value = link.dataset.enquiry;
      updateEnquiryMode();
      clearPreview();
    }
    if (link.dataset.machine && machine.value !== link.dataset.machine) {
      machine.value = link.dataset.machine;
      machine.setCustomValidity('');
      clearPreview();
    }
  });
});

const enquiryParams = new URLSearchParams(window.location.search);
const requestedIntent = enquiryParams.get('intent');
if (requestedIntent === 'inspection' || requestedIntent === 'source') {
  intent.value = requestedIntent;
  const locationField = requestedIntent === 'inspection' ? machineLocation : destination;
  const location = enquiryParams.get(locationField.name)?.trim();
  if (location && !locationField.value) {
    locationField.value = location.slice(0, locationField.maxLength);
  }
}

updateEnquiryMode();
form.noValidate = true;
fields.disabled = false;
