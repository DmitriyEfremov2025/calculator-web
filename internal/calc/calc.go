package calc

import "errors"

var (
	ErrInvalidOperator = errors.New("invalid operator")
	ErrDivisionByZero  = errors.New("division by zero")
)

func Compute(left, right float64, op string) (float64, error) {
	switch op {
	case "+":
		return left + right, nil
	case "-":
		return left - right, nil
	case "*":
		return left * right, nil
	case "/":
		if right == 0 {
			return 0, ErrDivisionByZero
		}
		return left / right, nil
	default:
		return 0, ErrInvalidOperator
	}
}
