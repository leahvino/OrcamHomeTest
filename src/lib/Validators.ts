// Validators.ts
export interface ValidatorResult {
    [validatorName: string]: {
      error: boolean;
      message?: string;
    };
  }
  
  export type ValidatorFn = (value: any) => ValidatorResult;
  
  function required(value: any): ValidatorResult {
    if (value === '' || value == null) {
      return { required: { error: true, message: 'Field is required' } };
    }
    return { required: { error: false } };
  }
  
  function isNumber(value: any): ValidatorResult {
    if (isNaN(+value) || value == null) {
      return { isNumber: { error: true, message: 'Field is not number' } };
    }
    return { isNumber: { error: false } };
  }

  export const Validators = {
    required,
    isNumber
  };