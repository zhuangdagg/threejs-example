/**
 * 获取顶点数据
 */
export function getPositionData(X_SEGMENTS: number = 50, Y_SEGMENTS: number = 50) {
  // 圆顶点数组
  const PI = Math.PI;
  const sin = Math.sin;
  const cos = Math.cos;

  const positions: number[] = [];
  // 生成球的顶点
  for (let y = 0; y <= Y_SEGMENTS; y++) {
    const ySegment = y / Y_SEGMENTS;
    for (let x = 0; x <= X_SEGMENTS; x++) {
      const xSegment = x / X_SEGMENTS;
      const xPos = cos(xSegment * 2.0 * PI) * sin(ySegment * PI);
      const yPos = cos(ySegment * PI);
      const zPos = sin(xSegment * 2.0 * PI) * sin(ySegment * PI);

      positions.push(xPos, yPos, zPos);
    }
  }

  return positions;
}

/**
 * 获取索引数据
 */
export function getIndicesData(X_SEGMENTS: number, Y_SEGMENTS: number) {
  const indices: number[] = [];

  for (let i = 0; i < Y_SEGMENTS; i++) {
    for (let j = 0; j < X_SEGMENTS; j++) {
      indices.push(i * (X_SEGMENTS + 1) + j);
      indices.push((i + 1) * (X_SEGMENTS + 1) + j);
      indices.push((i + 1) * (X_SEGMENTS + 1) + j + 1);

      indices.push(i * (X_SEGMENTS + 1) + j);
      indices.push((i + 1) * (X_SEGMENTS + 1) + j + 1);
      indices.push(i * (X_SEGMENTS + 1) + j + 1);
    }
  }

  return indices;
}

/**
 * 获取球体顶点数据
 * @params X_SEGMENTS x片段
 * @params Y_SEGMENTS y片段
 * @return sphere { vertex, index }
 */
export function getSphereData(X_SEGMENTS: number, Y_SEGMENTS: number) {
  return {
    vertex: getPositionData(X_SEGMENTS, Y_SEGMENTS),
    index: getIndicesData(X_SEGMENTS, Y_SEGMENTS)
  }
}