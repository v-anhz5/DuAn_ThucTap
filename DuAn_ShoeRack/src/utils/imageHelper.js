// Hàm helper để xử lý ảnh một cách nhất quán
export const getImageSource = (imagePath) => {
  if (!imagePath) {
    return require('../../assets/img_icon/image_giay.png');
  }
  
  if (typeof imagePath === 'string') {
    if (imagePath.startsWith('http')) {
      return { uri: imagePath };
    } else {
      // Nếu là tên file local, thử map với imageMap
      const imageMap = {
        'icon_nike.webp': require('../../assets/img_icon/icon_nike.webp'),
        'icon_adidas.jpg': require('../../assets/img_icon/icon_adidas.jpg'),
        'icon_puma.jpg': require('../../assets/img_icon/icon_puma.jpg'),
        'icon_vans.jpg': require('../../assets/img_icon/icon_vans.jpg'),
        'icon_fila.png': require('../../assets/img_icon/icon_fila.png'),
        'icon_Red Tape.png': require('../../assets/img_icon/icon_Red Tape.png'),
        'icon_under armour.jpg': require('../../assets/img_icon/icon_under armour.jpg'),
        'image_giay.png': require('../../assets/img_icon/image_giay.png'),
      };
      return imageMap[imagePath] || require('../../assets/img_icon/image_giay.png');
    }
  }
  
  return imagePath; // Nếu đã là require object
};

// Hàm xử lý mảng ảnh
export const processImageArray = (images) => {
  if (!images || images.length === 0) {
    return [require('../../assets/img_icon/image_giay.png')];
  }
  
  return images.map(img => {
    if (typeof img === 'string') {
      if (img.startsWith('http')) {
        return { uri: img };
      } else {
        const imageMap = {
          'icon_nike.webp': require('../../assets/img_icon/icon_nike.webp'),
          'icon_adidas.jpg': require('../../assets/img_icon/icon_adidas.jpg'),
          'icon_puma.jpg': require('../../assets/img_icon/icon_puma.jpg'),
          'icon_vans.jpg': require('../../assets/img_icon/icon_vans.jpg'),
          'icon_fila.png': require('../../assets/img_icon/icon_fila.png'),
          'icon_Red Tape.png': require('../../assets/img_icon/icon_Red Tape.png'),
          'icon_under armour.jpg': require('../../assets/img_icon/icon_under armour.jpg'),
          'image_giay.png': require('../../assets/img_icon/image_giay.png'),
        };
        return imageMap[img] || require('../../assets/img_icon/image_giay.png');
      }
    }
    return img;
  });
}; 