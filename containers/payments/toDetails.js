const formatYear = (year) => {
    const pre = String(year).length === 2 ? '20' : '';
    return `${pre}${year}`;
};

const clear = (v) => String(v).trim();

const toDetails = ({ number, month: ExpMonth, year, cvc: CVC, fullname, zip: ZIP, country: Country }) => {
    return {
        Name: clear(fullname),
        Number: String(number).replace(/\s+/g, ''),
        ExpMonth,
        ExpYear: formatYear(year),
        CVC, // Don't clean ZIP, space is allowed
        ZIP,
        Country
    };
};

export default toDetails;
