import React, { Component, createRef, useEffect } from 'react';
import * as markerjs2 from 'markerjs2';

interface ImageEditorProps {
  imageSrc?: string;
  altText?: string;
  position?: { top: number; left: number };
  onImageEdit?: (dataUrl: string) => void;
}

class ImageEditor extends Component<ImageEditorProps> {
  imgRef = createRef<HTMLImageElement>();
  markerArea: markerjs2.MarkerArea | null = null; // markerjs2のインスタンスを保持

  componentDidMount() {
    // コンポーネントのマウント時にmarkerAreaを初期化.  showMarkerAreaは不要に
    if (this.imgRef.current) {
      this.markerArea = new markerjs2.MarkerArea(this.imgRef.current);
      this.markerArea.settings.displayMode = 'popup';
      this.setupMarkerAreaListeners();
    }
  }

  componentDidUpdate(prevProps: ImageEditorProps) {
    // imageSrcが変わった時だけ、markerAreaを再表示
    if (prevProps.imageSrc !== this.props.imageSrc && this.imgRef.current) {
      if (this.markerArea) {
        this.markerArea.close(); // 以前のものを閉じる。
        this.showMarkerArea(); //新しいsrcで表示
      }

    }
  }

  componentWillUnmount() {
    // コンポーネントのアンマウント時にリスナーを削除し、markerAreaを閉じる
    if (this.markerArea) {
      this.markerArea.close();
      this.markerArea = null; // インスタンスをクリア
    }
  }

  setupMarkerAreaListeners = () => {
    if (this.markerArea) {
      this.markerArea.addEventListener('render', this.handleRender);
      this.markerArea.addEventListener('show', this.handleShow);
    }
  }

  handleRender = (event: any) => {
    const { onImageEdit } = this.props;
    if (this.imgRef.current && onImageEdit) {
      onImageEdit(event.dataUrl); // コールバックでdataURLを渡す（imgのsrcは変更しない）
    }
  };


  handleShow = () => {
    // showイベント発生時の処理。座標取得など。
    const imgRect = this.imgRef.current!.getBoundingClientRect();
  };

  showMarkerArea = () => {
    if (this.markerArea) {
      this.markerArea.show();
    }
  }

  render() {
    const { imageSrc, altText } = this.props;

    const imgStyle = {
      width: '100%',
      height: 'auto',
      cursor: 'pointer',
      borderRadius: 1,
    };

    return (
      <div className="edit-image">
        <img
          ref={this.imgRef}
          src={imageSrc || "sample.jpg"}
          alt={altText || "sample"}
          style={imgStyle}
          onClick={this.showMarkerArea}
          crossOrigin="anonymous" // useEffectから移動.  src設定後なのでここでOK
        />
      </div>
    );
  }
}

export default ImageEditor;