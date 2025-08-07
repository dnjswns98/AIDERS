import * as ort from 'onnxruntime-web';
import { preprocessImage } from './preprocess.js';

const modelPath = '/model/crnn_48x1152.onnx'
const alphabetPath = '/alphabets/alphabet.txt'

let myModel = null;
let alphabet = null;

export async function initModel(){
    if(!myModel){
        // const ort = window.ort;
        ort.env.wasm.wasmPaths = '/onnxruntime-web/';
        // await ort.setBackend('wasm'); // 백엔드 설정
        // await ort.env.ready;          // 준비 완료 대기
        myModel = await ort.InferenceSession.create(modelPath);
        console.log('모델 로드 성공');
    }

    if(!alphabet){
        const res = await fetch('/alphabets/alphabet.txt');
        const text = await res.text();
        alphabet = text.trim().split('');
        console.log("alphabet 로드 성공");
    }

    return myModel;
}

export async function predict(base64string){
    await initModel();
    // console.log('시작');
    console.time('preprocessTime')
    const inputData = await preprocessImage(base64string);
    const inputTensor = new ort.Tensor('float32', inputData, [1,1,48,1152]);
    console.timeEnd('preprocessTime')
    
    console.time('predictTime');
    const feeds = { [myModel.inputNames[0]]: inputTensor };
    const results = await myModel.run(feeds);
    const output = results[myModel.outputNames[0]];
    console.timeEnd('predictTime');

    console.time('decode')
    const decoded = ctcDecode(output);
    console.timeEnd('decode')

    // console.log('종료');
    console.log("결과:", decoded);
    return decoded;
}

function ctcDecode(outputTensor){
    const [timesteps, batchSize, numClasses] = outputTensor.dims;
    const data = outputTensor.data;

    let decoded = '';
    let lastIndex = -1;

    for(let t = 0; t < timesteps; t++){
        const start = t * numClasses;
        let maxProb = -Infinity;
        let maxIndex = -1;

        for(let c = 0; c <numClasses; c++){
            const val = data[start + c];
            if(val > maxProb){
                maxProb = val;
                maxIndex = c;
            }
        }

        if(maxIndex !== lastIndex && maxIndex !==0){
            decoded += alphabet[maxIndex - 1];
        }

        lastIndex = maxIndex;
    }
    return decoded;
}