function sum(a: number, b: number) : number {
   return a + b;
}

function negate(a: boolean) : boolean {
    return !a;
 }

 function addSymbols123(a: boolean) : string {
    return a + "123";
 }

 function concat(a: string []) : string {
    return a.reduce((prev: string, cur: string) =>{
        return prev + cur;
    });
 }

 //A B C D E F - массив

// F(A, B), F(F(A, B), C), ...

const res = concat(["ABC", "DEF"])
console.log(res)


interface IObject1
{
    a: number; 
    b: number; 
    c: string;
} 

 type StringOrNumber = number | string | IObject1;

 function smth(a: StringOrNumber)
 {
    console.log(a);
 }
 
smth(5);
smth("");
smth({a:5, b:3, c:"30"});





//  type StringOtnu = number |
//  function concatGeneric<T>(a: T []) : T {
//     return a.reduce((prev, cur) : T =>{
//         return cur;
//     });
//  }
