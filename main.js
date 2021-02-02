window.addEventListener('DOMContentLoaded',() => {
    const ModalElement = document.querySelector('.modal-overlay')
    const openModalButton = document.querySelector('.button.new')
    const cancelModalUse = document.querySelector('.button.cancel')

    const ModalFunctions = {
        open:() => () => ModalElement.classList.add('active'),
        close:() => () => ModalElement.classList.remove('active')
    }

    openModalButton.addEventListener('click',ModalFunctions.open() )
    cancelModalUse.addEventListener('click',ModalFunctions.close() )
})