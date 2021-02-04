window.addEventListener('DOMContentLoaded',start())

function start(){
    function Modal(){
        const ModalElement = document.querySelector('.modal-overlay')
        const openModalButton = document.querySelector('.button.new')
        const cancelModalUse = document.querySelector('.button.cancel')
    
        const ModalFunctions = {
            toggle:() => () => ModalElement.classList.toggle('active')
        }
    
        openModalButton.addEventListener('click',ModalFunctions.toggle())
        cancelModalUse.addEventListener('click',ModalFunctions.toggle())
    }

    function Transactions(){

        const Utils = {
            formatCurrency(value){
                const signal = Number(value) < 0 ? "-" : '';
                
                const onlyDigitsInString = String(value).replace(/\D/g,"")
                const formatedValue = Number(onlyDigitsInString) / 100
                const currency = formatedValue.toLocaleString("pt-br",{
                    style: "currency",
                    currency:"BRL"
                })

                return signal + currency
            }
        }

        const Storage = {
            get(){
                return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
            },

            set(transactions){
                localStorage.setItem("dev.finances:transactions",JSON.stringify(transactions))
            }
        }

        const TransactionFunctions = {
            all: Storage.get(),

            add(transaction){
                TransactionFunctions.all.push(transaction)

                App.reload();
            },

            remove(index){
                TransactionFunctions.all.splice(index, 1);

                App.reload();
            },

            incomes(){
                let income = 0
                TransactionFunctions.all.forEach(({ amount }) => {
                    if(amount > 0) income += amount;
                })

                return income
            },

            expenses(){
                let expense = 0
                TransactionFunctions.all.forEach(({ amount }) => {
                    if(amount < 0) expense += amount;
                })

                return expense
            },

            total(){
                return TransactionFunctions.incomes() + TransactionFunctions.expenses()
            }
        }

        const DOM = {
            transactionsContainer:document.querySelector('#data-table tbody'),

            addTransaction( transaction,index ){
               const tr = document.createElement('tr');
               tr.innerHTML = DOM.innerHtmlTransaction(transaction,index)
               tr.dataset.index = index
               const image = tr.querySelector(`img#remove_${index}`)
               image.addEventListener('click',() => {
                  TransactionFunctions.remove(index)
                  window.NotificateUser(`A transação selecionada foi removida`)
               })

               DOM.transactionsContainer.appendChild(tr)

            },

            innerHtmlTransaction({ description, amount,date },index){
                if(!description && !amount && !date ) return '';
                const CSSClass = amount < 0 ? "expense" : "income"

                const formatedAmount = Utils.formatCurrency(amount)

                const html = `
                    <td class="description">${description}</td>
                    <td class="${CSSClass}">${formatedAmount}</td>
                    <td class="date">${date}</td>
                    <td>
                        <img src="./assets/minus.svg" alt="remover transação" id="remove_${index}" class="remove_transaction">
                    </td>
                `;

                return html;
            },

            updateBalance(){
                document
                    .getElementById('incomeDisplay')
                    .innerHTML = Utils.formatCurrency(TransactionFunctions.incomes())

                document
                    .getElementById('expenseDisplay')
                    .innerHTML = Utils.formatCurrency(TransactionFunctions.expenses())

                document
                    .getElementById('totalDisplay')
                    .innerHTML = Utils.formatCurrency(TransactionFunctions.total())
            },

            clearTransactions(){
                DOM.transactionsContainer.innerHTML = '';
            }
        }

        const App = {
            init(){
                TransactionFunctions.all.forEach(DOM.addTransaction)

                DOM.updateBalance()

                Storage.set(TransactionFunctions.all)
            },
            reload(){
                DOM.clearTransactions()
                App.init()
            }
        }

        window.APP = App;
        window.TransactionFunctions = TransactionFunctions;
    }

    function Form(){
        const descriptionInput = document.querySelector('input#description')
        const amountInput = document.querySelector('input#amount')
        const dateInput = document.querySelector('input#date')

        const Utils = {
            sleep(ms) {
                return new Promise(r => setTimeout(r,ms))
            },

            formatAmount(value){
                return Number(value.replace(/\,\./g, "")) * 100 
            },

            formatDate(date){
                const [ year,month,day ] = date.split("-")
                return `${day}/${month}/${year}`
            }
        }
        
        function getValues(){
            return {
                description: descriptionInput.value,
                amount: amountInput.value,
                date: dateInput.value,
            }
        }

        function validateFields(){
            const { description, amount, date } = getValues()
            if( description.trim() === "" || 
                amount.trim() === "" || 
                date.trim() === ""){
                throw new Error('Por favor,preencha todos os campos')
            }
        }

        function formatValues(){
            const { description, amount, date } = getValues()

            const formatedAmount = Utils.formatAmount(amount)
            const formatedDate = Utils.formatDate(date)

            return { 
                description, 
                amount:formatedAmount, 
                date:formatedDate 
            }
        }

        function closeModal(){
            removeErrors()
            document.querySelector('.button.cancel').click()
        }

        async function showErrorToUser(error){
            const errorContainer = document.querySelector('.input-group.error p');
            errorContainer.innerHTML = error;

            const errorLine = document.querySelector('.error-line')
            while(errorLine.style.width !== '100%'){
                const width = Number(errorLine.style.width.replace('%', '')); 
                await Utils.sleep(1)
                errorLine.style.width = `${width + 1}%`;
            }

        }

        async function removeErrors(){
            const errorLine = document.querySelector('.error-line')
            errorLine.style.width = '0%' 

            const errorContainer = document.querySelector('.input-group.error p');
            errorContainer.innerHTML = '';
        }

        function clearFields(){
            descriptionInput.value = ""
            amountInput.value = ""
            dateInput.value = ""
        }

        const formElement = document.querySelector('form');
        formElement.addEventListener('submit',event => {
            event.preventDefault()
            
            try{
                removeErrors()
                validateFields()
                const transaction = formatValues()
                window.TransactionFunctions.add(transaction)
                window.NotificateUser(`A transação ${transaction.description} foi adicionada`)
                clearFields()
                closeModal()
            }catch(error){
                showErrorToUser(error.message)
            }
        })
    }

    function DarkMode(){
        const darkModeCheckbox = document.querySelector('#switch')

        function changeText(hasDarkMode){
            const p = document.querySelector('.toggle p')
            p.textContent = hasDarkMode ? 'Dark Mode' : 'Light Mode';
            darkModeCheckbox.checked = p.textContent === "Dark Mode"
            window.NotificateUser(`Tema selecionado:${p.textContent || 'Light Mode'}`)
        }

        const onChangeButton = () => {
            const html = document.querySelector('html')
            const hasDarkMode = html.classList.toggle('dark-mode')
            
            localStorage.setItem("dev.finances:mode", String(hasDarkMode))
            changeText(hasDarkMode)
        }

        const hasDarkMode = (localStorage.getItem("dev.finances:mode") || "false") === "false" ? false : true;

        changeText(hasDarkMode)
        if(hasDarkMode) onChangeButton()

        darkModeCheckbox.addEventListener('change',onChangeButton)
    }

    function Notifications(message){
        if (!("Notification" in window)) return;
        if(!message) return
        
        if (Notification.permission === "granted") {
            const notification = new Notification(message);
        }
        
        else if (Notification.permission !== 'denied') {
            Notification.requestPermission( permission => {
              if (permission === "granted") {
                const notification = new Notification(message);
            }})
        }
    }

    function Squares(){
        const ulSquares = document.querySelector("ul.squares")
        const random = (min , max) => Math.random() * (max - min) + min;

        for(let squareIndex = 0; squareIndex <= 6;squareIndex++){
            const li = document.createElement("li")

            const size = Math.floor(random(10,120));
            const position = random(1, 99);
            const delay = random(5, 0.1);
            const duration = random(24, 12);

            li.style.width = `${size}px`;
            li.style.height = `${size}px`;
            li.style.bottom = `-${size}px`;

            li.style.left = `${position}%`

            li.style.animationDelay = `${delay}s`
            li.style.animationDuration = `${duration}s`
            li.style.animationTimingFunction = `cubic-bezier(${Math.random()},${Math.random()},${Math.random()},${Math.random()})`

            ulSquares.appendChild(li)
        }
    }

    return () => {
        window.NotificateUser = Notifications;
        Squares()
        DarkMode();
        Transactions();
        Modal();
        Form();
        window.APP.init()
    }
}
