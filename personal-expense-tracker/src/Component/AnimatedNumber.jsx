import CountUp from "react-countup";

export default function AnimatedNumber({ value, prefix = "", suffix = "" }) {
  return (
    <CountUp
      end={value}
      duration={1.2}
      separator=","
      prefix={prefix}
      suffix={suffix}
    />
  );
}
