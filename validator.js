const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
// Validator object => nhu 1 thu vien doc lap
function Validator(options){
    // dau vao: tu element con 
    // dau ra mong doi: lay ra element cha co selector do
    function getParent(element,selector){
        while(element.parentElement){
            // kiem tra parentElement co selector do ko
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }

    }


    // ham thuc hien validate
    var selectorRules = {} // store the rules of input elements
    function validate(inputElement, rule){
        // thay viec get parent cua input element bang parentElement nhu btn thi ko dam bao vi chua chac element cha muon lay la
        // cha lien ke cua input element do, vi vay phai su dung ham getParent de lay parent co selector phu hop
        //var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage;
        // Lấy ra các rule của selector này 
        var rules = selectorRules[rule.selector];
        //console.log(rules);
        // Lặp qua từng rule và kiểm tra
        // Nếu có lỗi thì dừng việc kiểm tra
        for(let ruleItem of rules)  {
            switch(inputElement.type){
                case 'checkbox':
                case 'radio':
                    errorMessage = ruleItem(
                        formElement.querySelector(rule.selector+":checked")
                    )
                    break;
                default:
                    errorMessage = ruleItem(inputElement.value);
            }
            
            if(errorMessage) break;
        }
        if(errorMessage){
            errorElement.innerText = errorMessage;
            getParent(inputElement,options.formGroupSelector).classList.add('invalid');
        }
        else{
            errorElement.innerText = '';
            getParent(inputElement,options.formGroupSelector).classList.remove('invalid');
        }

        return !errorMessage;
    }
    // lay element cua form can validate 
    var formElement = $(options.form);
    if(formElement){
        // khi submit form 
        formElement.onsubmit = function(e){
            // loai bo default cua submit form
            e.preventDefault();
            
            var isFormValid = true;
            // lap qua tung rule va validate
            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement,rule);
                // neu chi can 1 rule ma ko valid => thi ca form se ko valid
                if(!isValid){
                    isFormValid = false;
                }
            });

            if(isFormValid){
                if(typeof options.onSubmit === 'function'){// truong hop submit vs javascript
                    
                    // xu ly form loi
                    // select tat ca cac element ma co tt name ma ko co tt disabled : disabled la ko the tt voi 
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    var formValues = Array.from(enableInputs).reduce(function (values, input){
                        // gan input.value vao trong object values voi key: ten cua input va gia tri: gia tri cua input
                        // values[input.name] = input.value;
                        switch (input.type) {
                            case 'radio':
                                // chọn
                                values[input.name] =formElement.querySelector('input[name ="'+input.name+'"]:checked').value;
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')) {
                                    values[input.name] = '';
                                    return values;}
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;   
                        }
                        // va tra ve values
                        return values;
                    },{})
                    
                    options.onSubmit(formValues); 
                }
                else{
                    // truong submit voi hanh vi mac dinh
                    formElement.submit();
                }
            }
            
        }



        // lap qua moi form va xu ly (lang nghe su kien nhu blur,input)
        options.rules.forEach(function(rule){
            // luu lai rules cho moi input
            if(Array.isArray(selectorRules[rule.selector])){
                // neu da la mang thi push rule vao
                selectorRules[rule.selector].push(rule.test);
            }else{
                // neu no ko phai mang (tuc la rule dau tien) thi them mang 1 laf rule.test
                selectorRules[rule.selector] = [rule.test];
            }
            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function(inputElement){
                    // xử lý trường hợp blur khỏi input
                    inputElement.onblur = function(){
                        validate(inputElement,rule);
                    }
    
                    // xử lý trường hợp mỗi khi người dùng nhập vào inputElement
                    inputElement.oninput = function(){
                        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);
                        errorElement.innerText = '';
                        getParent(inputElement,options.formGroupSelector).classList.remove('invalid');
                    }
                    inputElement.onchange = function(){

                    }
            })
            
        })
        
    }
}
// define rules
// nguyen tac cua cac rules:
// 1. khi co loi thi tra ra message loi
// 2. khi hop le thi ko tra ra gi ca (undefined)

// viết riêng ra các rule để sau này chỉ việc thêm theo các rule mà không cần sửa phần login phía trên

// them arg message vao function de code co the su dung lai => custom message
Validator.isRequired = function (selector,message){
    return{
        selector: selector,
        test: function (value){
            return value ? undefined : message ||'Vui lòng nhập trường này'
        }
    };
}
Validator.isEmail = function(selector,message) {
    return{
        selector: selector,
        test: function (value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value)? undefined : message|| 'Trường này phải là email'
        }
    };
}

Validator.isMinLength = function(selector,min,message){
    return{
        selector: selector,
        test: function (value){
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiếu ${min} ký tự`
        }
    };
}
Validator.isConfirmed = function(selector,getConfirmValue,message) {
    return{
        selector: selector,
        test: function (value){
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    };
}
