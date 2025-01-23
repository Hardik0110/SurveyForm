function f(){
    console.log('f');
    return 2;
}

function g(){
    console.log('g');
    return 3;
}

let x,y;

y = x = f();
y = [f(), x = g()];
x[f()] = g();
