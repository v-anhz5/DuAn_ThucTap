// Hàm helper để xử lý ảnh một cách nhất quán
export const getImageSource = (imagePath) => {
  if (!imagePath) {
    return require('../../assets/img_icon/image_giay.jpg');
  }
  
  if (typeof imagePath === 'string') {
    if (imagePath.startsWith('http')) {
      return { uri: imagePath };
    } else {
      // Nếu là tên file local, thử map với imageMap
      const imageMap = {
        'icon_nike.jpg': require('../../assets/img_icon/icon_nike.jpg'),
        'icon_adidas.png': require('../../assets/img_icon/icon_adidas.png'),
        'icon_puma.png': require('../../assets/img_icon/icon_puma.png'),
        'icon_fila.png': require('../../assets/img_icon/icon_fila.png'),
        'icon_Red Tape.png': require('../../assets/img_icon/icon_Red Tape.png'),
        'icon_vans.webp': require('../../assets/img_icon/icon_vans.webp'),
        'image_giay.jpg': require('../../assets/img_icon/image_giay.jpg'),
        'under-armour-logo.png': require('../../assets/img_icon/under-armour-logo.png'),
      };
      return imageMap[imagePath] || require('../../assets/img_icon/image_giay.jpg');
    }
  }
  
  return imagePath; // Nếu đã là require object
};

// Hàm xử lý mảng ảnh
export const processImageArray = (images) => {
  if (!images || images.length === 0) {
    return [require('../../assets/img_icon/image_giay.jpg')];
  }
  
  return images.map(img => {
    if (typeof img === 'string') {
      if (img.startsWith('http')) {
        return { uri: img };
      } else {
        const imageMap = {
          'icon_nike.jpg': require('../../assets/img_icon/icon_nike.jpg'),
          'icon_adidas.png': require('../../assets/img_icon/icon_adidas.png'),
          'icon_puma.png': require('../../assets/img_icon/icon_puma.png'),
          'icon_fila.png': require('../../assets/img_icon/icon_fila.png'),
          'icon_Red Tape.png': require('../../assets/img_icon/icon_Red Tape.png'),
          'icon_vans.webp': require('../../assets/img_icon/icon_vans.webp'),
          'image_giay.jpg': require('../../assets/img_icon/image_giay.jpg'),
          'under-armour-logo.png': require('../../assets/img_icon/under-armour-logo.png'),
        };
        return imageMap[img] || require('../../assets/img_icon/image_giay.jpg');
      }
    }
    return img;
  });
}; 