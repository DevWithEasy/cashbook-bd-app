export default function formatTimeToBengali(timeString){
  if (!timeString) return "";
  
  try {
    const [hours, minutes] = timeString.split(':');
    
    let hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    
    // বাংলা সংখ্যায় কনভার্ট করুন
    const bengaliNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const convertToBengali = (num) => {
      return num.toString().split('').map(digit => bengaliNumbers[parseInt(digit)] || digit).join('');
    };
    
    return `${convertToBengali(hour)}:${convertToBengali(minutes)} ${period}`;
  } catch (error) {
    console.error("Time format error:", error);
    return timeString;
  }
};