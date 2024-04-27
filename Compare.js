document.addEventListener('DOMContentLoaded', async () => {
    // 加载模型
    await faceapi.loadSsdMobilenetv1Model('/weights');
    await faceapi.loadFaceLandmarkModel('/weights');
    await faceapi.loadFaceRecognitionModel('/weights');

    // 获取HTML元素
    const image1Input = document.getElementById('image1Input');
    const image2Input = document.getElementById('image2Input');
    const compareButton = document.getElementById('compareButton');
    const resultDiv = document.getElementById('result');
    const timeDisplay = document.getElementById('timeDisplay');

    let descriptors = [];

    // 当用户选择图像时触发
    image1Input.addEventListener('change', async () => await handleImageUpload('image1'));
    image2Input.addEventListener('change', async () => await handleImageUpload('image2'));

    // 处理图像上传
    async function handleImageUpload(imageId) {
        const imageElement = document.getElementById(imageId);
        const file = document.getElementById(imageId + 'Input').files[0];
        const imageURL = URL.createObjectURL(file);
        imageElement.src = imageURL;
        // 设置图片大小为200px宽度，高度自动计算保持比例
        imageElement.style.width = '200px';
        imageElement.style.height = 'auto';

        // 进行人脸检测和特征提取
        const detection = await faceapi.detectSingleFace(imageElement).withFaceLandmarks().withFaceDescriptor();

        // 如果检测到人脸，则保存人脸描述
        if (detection) {
            descriptors.push(detection.descriptor);
        } else {
            console.error('No face detected in the uploaded image');
        }
    }

    // 当用户点击比对按钮时触发
    compareButton.addEventListener('click', compareFaces);

    // 比对两张图片中的人脸
    async function compareFaces() {
        if (descriptors.length !== 2) {
            console.error('Please upload two images first');
            return;
        }

        //const startTime = performance.now(); // 记录开始时间

        // 计算欧氏距离
        const distance = faceapi.euclideanDistance(descriptors[0], descriptors[1]);
        // 计算相似度
        const similarity = 1 - distance;

        // 显示相似度结果
        resultDiv.innerText = `Similarity between faces: ${similarity.toFixed(4)}`;

        //const endTime = performance.now(); // 记录结束时间
        //const elapsedTime = endTime - startTime; // 计算时间差
        // 更新时间显示，并添加额外的文本描述
        //timeDisplay.innerText = `Time taken: ${elapsedTime.toFixed(4)} milliseconds`;

        // 重置描述符数组，以便下一次比对
        descriptors = [];
    }
});
