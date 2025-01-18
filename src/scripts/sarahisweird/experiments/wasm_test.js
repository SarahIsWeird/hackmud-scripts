function(context, args)
{
// <base64-encoded wasm goes here>
    if (args && args.quine === true) {
        return #fs.scripts.quine();
    }

    const wasm = #fs.sarahisweird.wasm_test({ quine: true })
        .split("\n")[2].substring(3);

    const lib = #fs.scripts.lib();

    function decodeBase64(s) {
        var e={},i,b=0,c,x,l=0,a,r='',w=String.fromCharCode,L=s.length;
        var A="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        for(i=0;i<64;i++){e[A.charAt(i)]=i;}
        for(x=0;x<L;x++){
            c=e[s.charAt(x)];b=(b<<6)+c;l+=6;
            while(l>=8){((a=(b>>>(l-=8))&0xff)||(x<(L-2)))&&(r+=w(a));}
        }
        return r;
    };

    const binaryData = decodeBase64(wasm);
    const data = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
        data[i] = binaryData.charCodeAt(i);
    }

    const module = new WebAssembly.Module(data);
    const { add } = new WebAssembly.Instance(module).exports;

    return { ok: true, msg: add(1, 2) };
}
